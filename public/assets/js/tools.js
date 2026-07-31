(() => {
  const toolsScriptUrl = document.currentScript?.src || "";
  const workspace = document.getElementById("workspace");
  if (!workspace) return;

  const tool = workspace.dataset.tool;
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const controls = document.getElementById("controls");
  const statusEl = document.getElementById("status");
  const dropHint = document.getElementById("dropHint");
  const tipEl = document.querySelector(".workspace .note");
  const actionsBar = document.getElementById("actionsBar");
  const dlBtn = document.getElementById("dlBtnTop");

  let files = [];
  let pendingFiles = [];
  let cutouts = [];
  let previewHtml = "";
  let bgColor = "transparent";
  let autoTimer = null;
  let runToken = 0;
  let busy = false;
  let faceApiReady = null;
  let ocrWorker = null;
  let bgRemovalWorker = null;
  let bgWorkerBroken = false;
  let bgWorkerSequence = 0;
  let mainThreadRemover = null;
  let rerunAfterBusy = false;
  const bgWorkerJobs = new Map();

  let manual = {
    source: null,
    mask: null,
    display: null,
    painting: false,
    scale: 1,
  };

  function downloadLabel() {
    const map = {
      "compress-image": "Download JPG",
      "resize-image": "Download JPG",
      "crop-image": "Download PNG",
      "rotate-image": "Download PNG",
      "flip-image": "Download PNG",
      "jpg-to-png": "Download PNG",
      "png-to-jpg": "Download JPG",
      "to-webp": "Download WebP",
      "webp-to-jpg": "Download JPG",
      "webp-to-png": "Download PNG",
      "png-to-webp": "Download WebP",
      "jpg-to-webp": "Download WebP",
      "grayscale-image": "Download PNG",
      "blur-faces": "Download PNG",
      "bg-remove": "Download PNG",
      "image-to-svg": "Download SVG",
      "images-to-pdf": "Download PDF",
      "pdf-to-word": "Download Word",
      "word-to-pdf": "Download PDF",
    };
    return map[tool] || "Download file";
  }

  function isDocExchangeTool() {
    return tool === "pdf-to-word" || tool === "word-to-pdf";
  }

  function setStatus(msg, type = "") {
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (type ? " " + type : "");
  }

  function queueFile(blobOrBytes, name, mime) {
    const blob =
      blobOrBytes instanceof Blob
        ? blobOrBytes
        : new Blob([blobOrBytes], { type: mime || "application/octet-stream" });
    pendingFiles.push({ blob, name });
  }

  function setDownloadEnabled(on) {
    if (!dlBtn) return;
    dlBtn.disabled = !on;
    dlBtn.textContent = downloadLabel();
  }

  function clearPreview() {
    pendingFiles = [];
    previewHtml = "";
    const panel = document.getElementById("resultPreview");
    const stage = document.getElementById("previewStage");
    if (panel) panel.hidden = true;
    if (stage) stage.innerHTML = "";
    setDownloadEnabled(false);
  }

  function isImageFile(file) {
    const type = file?.blob?.type || "";
    const name = file?.name || "";
    return type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name);
  }

  function isSvgFile(file) {
    const type = file?.blob?.type || "";
    const name = file?.name || "";
    return type.includes("svg") || /\.svg$/i.test(name);
  }

  function isPdfFile(file) {
    const type = file?.blob?.type || "";
    const name = file?.name || "";
    return type.includes("pdf") || /\.pdf$/i.test(name);
  }

  function buildPendingPreviewHtml() {
    if (previewHtml) return previewHtml;
    if (!pendingFiles.length) return "";

    const check = tool === "bg-remove" && bgColor === "transparent" ? " is-checkered" : "";
    const images = pendingFiles.filter(isImageFile);
    if (images.length > 1) {
      return `<div class="preview-gallery">${images
        .map(
          (file, index) => `
          <figure class="preview-gallery-item">
            <img class="preview-image${check}" src="${URL.createObjectURL(file.blob)}" alt="Preview ${index + 1}" />
            <figcaption>${index + 1}. ${file.name}</figcaption>
          </figure>`
        )
        .join("")}</div>`;
    }

    const first = pendingFiles[0];
    if (isSvgFile(first)) {
      return `<p class="preview-empty">SVG preview ready. Use Download below.</p>`;
    }
    if (isImageFile(first)) {
      return `<img class="preview-image${check}" src="${URL.createObjectURL(first.blob)}" alt="Preview" />`;
    }
    if (isPdfFile(first)) {
      return `<div class="preview-file-card">
        <strong>PDF ready</strong>
        <span>${first.name}</span>
        <em>${pendingFiles.length} file(s) · preview before download</em>
      </div>`;
    }
    return `<div class="preview-file-card">
      <strong>File ready</strong>
      <span>${first.name}</span>
      <em>Preview mode · download when it looks good</em>
    </div>`;
  }

  function showPreviewPanel(extraHtml = "") {
    const panel = document.getElementById("resultPreview");
    const stage = document.getElementById("previewStage");
    if (!panel || !stage) return;
    panel.hidden = false;
    const head = panel.querySelector(".preview-head h3");
    if (head) head.textContent = pendingFiles.length > 1 ? `Preview (${pendingFiles.length})` : "Preview";

    const body = buildPendingPreviewHtml();
    stage.innerHTML = `${extraHtml || ""}${body || `<p class="preview-empty">Your result will show here before download.</p>`}`;
    setDownloadEnabled(pendingFiles.length > 0);
  }

  function acceptAttr() {
    if (tool === "pdf-to-word") return "application/pdf,.pdf";
    if (tool === "word-to-pdf") {
      return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool === "jpg-to-png" || tool === "jpg-to-webp") return "image/jpeg,.jpg,.jpeg";
    if (tool === "png-to-jpg" || tool === "png-to-webp") return "image/png,.png";
    if (tool === "webp-to-jpg" || tool === "webp-to-png") return "image/webp,.webp";
    if (tool === "to-webp") return "image/jpeg,image/png,.jpg,.jpeg,.png";
    return "image/*";
  }

  function privacyMode() {
    return document.querySelector('input[name="privacyMode"]:checked')?.value || "faces";
  }

  function blurPercent() {
    return Number(document.getElementById("blurAmount")?.value || 50);
  }

  function blurStrength(refSize = 800) {
    // Map 10%-100% to pixel blur; scale a bit with image size
    const pct = blurPercent();
    const base = 4 + (pct / 100) * 36;
    const scale = Math.min(1.6, Math.max(0.7, refSize / 800));
    return Math.max(2, Math.round(base * scale));
  }

  function syncBlurLabel() {
    // kept for compatibility; amount is shown in the select itself
  }

  function brushSize() {
    return Number(document.getElementById("brushSize")?.value || 40);
  }

  fileInput.accept = acceptAttr();
  fileInput.multiple = !isDocExchangeTool();
  dropHint.textContent =
    tool === "pdf-to-word"
      ? "One PDF file. Text remains editable in Word."
      : tool === "word-to-pdf"
      ? "One Word .docx file. Preview the PDF before download."
      : tool === "blur-faces"
      ? "JPG, PNG or WebP. Auto blur faces, or paint areas to blur."
      : "You can select multiple images";

  if (tipEl) tipEl.hidden = true;

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-drag");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-drag"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-drag");
    addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", () => addFiles(fileInput.files));

  function scheduleAutoRun(delay = 350) {
    clearTimeout(autoTimer);
    if (!files.length) return;
    autoTimer = setTimeout(() => {
      if (tool === "blur-faces" && privacyMode() === "manual") {
        openManualEditor().catch((err) => setStatus(err.message || "Something went wrong.", "error"));
      } else {
        runTool().catch((err) => setStatus(err.message || "Something went wrong.", "error"));
      }
    }, delay);
  }

  function addFiles(list) {
    const arr = Array.from(list || []);
    if (!arr.length) return;
    if (tool === "pdf-to-word" && !/\.pdf$/i.test(arr[0].name || "")) {
      setStatus("Please choose a PDF file.", "error");
      return;
    }
    if (tool === "word-to-pdf") {
      const name = arr[0].name || "";
      if (/\.doc$/i.test(name) && !/\.docx$/i.test(name)) {
        setStatus("Older .doc files are not supported. Save as .docx in Word and try again.", "error");
        return;
      }
      if (!/\.docx$/i.test(name)) {
        setStatus("Please choose a Word .docx file.", "error");
        return;
      }
    }
    files =
      isDocExchangeTool() || (tool === "blur-faces" && privacyMode() === "manual")
        ? [arr[0]]
        : files.concat(arr);
    cutouts = [];
    manual = { source: null, mask: null, display: null, painting: false, scale: 1 };
    clearPreview();
    renderFiles();
    setStatus(
      tool === "pdf-to-word"
        ? "Reading PDF..."
        : tool === "word-to-pdf"
        ? "Reading Word document..."
        : `${files.length} image(s). Generating preview...`
    );
    scheduleAutoRun(tool === "bg-remove" || tool === "blur-faces" ? 150 : 250);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderFiles() {
    fileList.innerHTML = files
      .map(
        (f, i) =>
          `<li><span>${escapeHtml(f.name)}</span><button type="button" data-i="${i}" class="ghost">Remove</button></li>`
      )
      .join("");
    fileList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        files.splice(Number(btn.dataset.i), 1);
        cutouts = [];
        manual = { source: null, mask: null, display: null, painting: false, scale: 1 };
        clearPreview();
        renderFiles();
        if (files.length) {
          setStatus(`${files.length} image(s). Updating preview...`);
          scheduleAutoRun(200);
        } else {
          setStatus("");
        }
      });
    });
  }

  const BG_PRESETS = [
    { id: "transparent", label: "Transparent", value: "transparent" },
    { id: "white", label: "White", value: "#ffffff" },
    { id: "black", label: "Black", value: "#000000" },
    { id: "gray", label: "Gray", value: "#e5e7eb" },
    { id: "green", label: "Green screen", value: "#00b140" },
    { id: "blue", label: "Blue", value: "#2563eb" },
    { id: "pink", label: "Pink", value: "#f9a8d4" },
  ];

  function syncCompressControls() {
    const mode = document.getElementById("compressMode")?.value || "quality";
    const qualityWrap = document.getElementById("qualityWrap");
    const targetWrap = document.getElementById("targetWrap");
    if (qualityWrap) qualityWrap.hidden = mode !== "quality";
    if (targetWrap) targetWrap.hidden = mode !== "size";
  }

  function buildControls() {
    if (tool === "compress-image") {
      controls.innerHTML = `
        <div class="compress-controls">
          <label>Mode
            <select id="compressMode">
              <option value="quality">Quality</option>
              <option value="size" selected>Target file size</option>
            </select>
          </label>
          <label id="qualityWrap" hidden>Quality
            <input type="range" id="quality" min="0.4" max="0.95" step="0.01" value="0.8" />
          </label>
          <label id="targetWrap" class="target-size-wrap">Target size
            <span class="target-size-inputs">
              <input type="number" id="targetSize" min="1" step="1" value="200" />
              <select id="targetUnit">
                <option value="kb" selected>KB</option>
                <option value="mb">MB</option>
              </select>
            </span>
          </label>
        </div>
        <p class="control-hint">Tip: enter the size you want (example 200 KB), then download the compressed JPG. The full image is kept. No objects are removed.</p>`;
      syncCompressControls();
    } else if (tool === "resize-image") {
      controls.innerHTML = `
        <label>Width <input type="number" id="width" min="1" placeholder="1920" /></label>
        <label>Height <input type="number" id="height" min="1" placeholder="auto" /></label>
        <label><input type="checkbox" id="keepRatio" checked /> Keep ratio</label>`;
    } else if (tool === "crop-image") {
      controls.innerHTML = `
        <label>X <input type="number" id="cropX" min="0" value="0" /></label>
        <label>Y <input type="number" id="cropY" min="0" value="0" /></label>
        <label>Width <input type="number" id="cropW" min="1" value="400" /></label>
        <label>Height <input type="number" id="cropH" min="1" value="400" /></label>`;
    } else if (tool === "rotate-image") {
      controls.innerHTML = `<label>Angle
        <select id="angle"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option><option value="360">360°</option></select>
      </label>`;
    } else if (tool === "flip-image") {
      controls.innerHTML = `<label>Direction
        <select id="flipDir"><option value="h">Horizontal</option><option value="v">Vertical</option></select>
      </label>`;
    } else if (tool === "blur-faces") {
      const pctOpts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        .map((p) => `<option value="${p}"${p === 50 ? " selected" : ""}>${p}%</option>`)
        .join("");
      controls.innerHTML = `
        <div class="blur-toolbar">
          <div class="mode-tabs" role="radiogroup" aria-label="Blur mode">
            <label class="mode-tab"><input type="radio" name="privacyMode" value="faces" checked /> Auto faces</label>
            <label class="mode-tab"><input type="radio" name="privacyMode" value="manual" /> Manual brush</label>
          </div>
          <label class="blur-amount-label">Blur amount
            <select id="blurAmount" aria-label="Blur amount">${pctOpts}</select>
          </label>
          <label id="brushSizeWrap" class="brush-wrap" hidden>Brush size
            <input type="range" id="brushSize" min="12" max="120" step="1" value="40" />
          </label>
          <button type="button" class="ghost" id="clearMaskBtn" hidden>Clear brush</button>
        </div>`;
      syncPrivacyControls();
    } else if (tool === "image-to-svg") {
      controls.innerHTML = `
        <label>Detail
          <select id="svgDetail">
            <option value="8">Simple (8 colors)</option>
            <option value="16" selected>Balanced (16 colors)</option>
            <option value="32">Detailed (32 colors)</option>
            <option value="64">Extra detail (64 colors)</option>
          </select>
        </label>`;
    } else if (tool === "bg-remove") {
      const swatches = BG_PRESETS.map(
        (p) =>
          `<button type="button" class="bg-swatch${p.value === bgColor ? " is-active" : ""}" data-bg="${p.value}" title="${p.label}" aria-label="${p.label}">
            <span class="bg-swatch-fill" style="${p.value === "transparent" ? "" : `background:${p.value}`}"></span>
          </button>`
      ).join("");
      controls.innerHTML = `
        <div class="bg-picker">
          <span class="bg-picker-label">Background (optional)</span>
          <div class="bg-swatches">${swatches}
            <label class="bg-swatch bg-swatch--custom" title="Custom color">
              <span class="bg-plus" aria-hidden="true">+</span>
              <input type="color" id="bgCustom" value="#ff6b5e" />
            </label>
          </div>
        </div>`;
    } else {
      controls.innerHTML = "";
    }

    setDownloadEnabled(false);
    if (dlBtn) {
      dlBtn.onclick = () => {
        if (!pendingFiles.length) {
          setStatus("Wait for preview, then download.", "error");
          return;
        }
        pendingFiles.forEach((f, i) => {
          setTimeout(() => CZImage.downloadBlob(f.blob, f.name), i * 280);
        });
        setStatus("Download started.", "ok");
      };
    }

    controls.querySelectorAll("input, select").forEach((el) => {
      if (el.id === "bgCustom" || el.name === "privacyMode") return;
      const evt = el.type === "range" || el.type === "number" ? "input" : "change";
      el.addEventListener(evt, () => {
        if (el.id === "compressMode") syncCompressControls();
        if (!files.length) return;
        if (tool === "blur-faces" && privacyMode() === "manual") {
          if ((el.id === "blurAmount" || el.id === "brushSize") && manual.source) {
            refreshManualPreview().catch(() => {});
          }
          return;
        }
        setStatus("Updating preview...");
        scheduleAutoRun(el.type === "range" || el.id === "targetSize" ? 450 : 300);
      });
    });

    if (tool === "bg-remove") {
      controls.querySelectorAll(".bg-swatch[data-bg]").forEach((btn) => {
        btn.addEventListener("click", () => setBgColor(btn.dataset.bg));
      });
      const custom = document.getElementById("bgCustom");
      if (custom) custom.addEventListener("input", () => setBgColor(custom.value));
    }

    if (tool === "blur-faces") {
      controls.querySelectorAll('input[name="privacyMode"]').forEach((el) => {
        el.addEventListener("change", () => {
          syncPrivacyControls();
          if (!files.length) return;
          setStatus("Switching mode...");
          scheduleAutoRun(120);
        });
      });
      document.getElementById("clearMaskBtn")?.addEventListener("click", () => {
        if (!manual.mask) return;
        const ctx = manual.mask.getContext("2d");
        ctx.clearRect(0, 0, manual.mask.width, manual.mask.height);
        refreshManualPreview().catch(() => {});
        setStatus("Brush cleared. Paint areas to blur.", "ok");
      });
    }
  }

  function syncPrivacyControls() {
    const manualOn = privacyMode() === "manual";
    const brushWrap = document.getElementById("brushSizeWrap");
    const clearBtn = document.getElementById("clearMaskBtn");
    if (brushWrap) brushWrap.hidden = !manualOn;
    if (clearBtn) clearBtn.hidden = !manualOn;
  }

  function setBgColor(value) {
    bgColor = value || "transparent";
    controls.querySelectorAll(".bg-swatch[data-bg]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.bg === bgColor);
    });
    if (cutouts.length) {
      applyBackgroundToCutouts()
        .then(() => {
          showPreviewPanel();
          setStatus(
            bgColor === "transparent"
              ? "Preview updated. Download when ready."
              : `Background color applied. Download when ready.`,
            "ok"
          );
        })
        .catch((err) => setStatus(err.message || "Could not apply background.", "error"));
    }
  }

  buildControls();

  async function runTool() {
    if (!files.length) return;
    if (busy && tool === "bg-remove") {
      rerunAfterBusy = true;
      return;
    }
    if (tool === "blur-faces" && privacyMode() === "manual") {
      await openManualEditor();
      return;
    }

    const token = ++runToken;
    busy = true;
    clearPreview();
    setStatus(tool === "bg-remove" ? "Removing background..." : tool === "compress-image" ? "Compressing image..." : "Working...");
    let doneMessage = "Preview ready. Download if it looks good.";

    try {
      switch (tool) {
        case "compress-image":
          doneMessage = await compressImages();
          break;
        case "resize-image":
          await resizeImages();
          break;
        case "crop-image":
          await cropImages();
          break;
        case "rotate-image":
          await rotateImages();
          break;
        case "flip-image":
          await flipImages();
          break;
        case "jpg-to-png":
        case "webp-to-png":
          await convertImages("image/png", "png");
          break;
        case "png-to-jpg":
        case "webp-to-jpg":
          await convertImages("image/jpeg", "jpg", 0.92);
          break;
        case "to-webp":
        case "png-to-webp":
        case "jpg-to-webp":
          await convertImages("image/webp", "webp", 0.9);
          break;
        case "grayscale-image":
          await effectImages("grayscale");
          break;
        case "blur-faces":
          await hideFaces();
          break;
        case "bg-remove":
          await removeBackgrounds();
          if (token !== runToken) return;
          await applyBackgroundToCutouts();
          break;
        case "image-to-svg":
          await imagesToSvg();
          break;
        case "images-to-pdf":
          await imagesToPdf();
          break;
        case "pdf-to-word":
          await pdfToWord();
          break;
        case "word-to-pdf":
          await wordToPdf();
          break;
        default:
          throw new Error("Unknown tool.");
      }

      if (token !== runToken) return;
      if (!pendingFiles.length) throw new Error("Nothing to preview.");

      if (!previewHtml && pendingFiles[0] && isSvgFile(pendingFiles[0])) {
        const svgText = await pendingFiles[0].blob.text();
        previewHtml = `<div class="preview-svg">${svgText}</div>`;
      }
      showPreviewPanel();
      setStatus(doneMessage || "Preview ready. Download if it looks good.", "ok");
    } finally {
      if (token === runToken) {
        busy = false;
        if (rerunAfterBusy) {
          rerunAfterBusy = false;
          scheduleAutoRun(50);
        }
      }
    }
  }

  async function ensureFaceApi() {
    if (faceApiReady) return faceApiReady;
    faceApiReady = (async () => {
      if (!window.faceapi) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/dist/face-api.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Could not load face detection library."));
          document.head.appendChild(s);
        });
      }
      const modelUrl = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model";
      await window.faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      return true;
    })();
    return faceApiReady;
  }

  async function detectFaces(img) {
    if (window.FaceDetector) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 20 });
        const faces = await detector.detect(img);
        if (faces.length) {
          return faces.map((f) => {
            const b = f.boundingBox;
            return { x: b.x, y: b.y, w: b.width, h: b.height };
          });
        }
      } catch (e) {
        /* use face-api fallback */
      }
    }
    await ensureFaceApi();
    const detections = await window.faceapi.detectAllFaces(
      img,
      new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
    );
    return detections.map((d) => {
      const b = d.box;
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    });
  }

  function blurBoxOnCanvas(ctx, source, box, strength) {
    const pad = Math.max(box.w, box.h) * 0.18;
    const x = Math.max(0, Math.floor(box.x - pad));
    const y = Math.max(0, Math.floor(box.y - pad));
    const w = Math.min(source.width - x, Math.ceil(box.w + pad * 2));
    const h = Math.min(source.height - y, Math.ceil(box.h + pad * 2));
    if (w < 2 || h < 2) return;

    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext("2d");
    tctx.filter = `blur(${strength}px)`;
    tctx.drawImage(source, x, y, w, h, 0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(tmp, x, y);
    ctx.restore();
  }

  function applyMaskBlur(sourceCanvas, maskCanvas, strength) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const octx = out.getContext("2d");
    octx.drawImage(sourceCanvas, 0, 0);

    const blurred = document.createElement("canvas");
    blurred.width = w;
    blurred.height = h;
    const bctx = blurred.getContext("2d");
    bctx.filter = `blur(${strength}px)`;
    bctx.drawImage(sourceCanvas, 0, 0);

    const base = octx.getImageData(0, 0, w, h);
    const soft = bctx.getImageData(0, 0, w, h);
    const mask = maskCanvas.getContext("2d").getImageData(0, 0, w, h);
    for (let i = 0; i < base.data.length; i += 4) {
      const a = mask.data[i + 3] / 255;
      if (a > 0.02) {
        base.data[i] = soft.data[i] * a + base.data[i] * (1 - a);
        base.data[i + 1] = soft.data[i + 1] * a + base.data[i + 1] * (1 - a);
        base.data[i + 2] = soft.data[i + 2] * a + base.data[i + 2] * (1 - a);
      }
    }
    octx.putImageData(base, 0, 0);
    return out;
  }

  async function hideFaces() {
    setStatus("Detecting faces...");
    let totalFaces = 0;
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const img = await CZImage.loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const clean = document.createElement("canvas");
      clean.width = canvas.width;
      clean.height = canvas.height;
      clean.getContext("2d").drawImage(canvas, 0, 0);
      const strength = blurStrength(Math.max(img.naturalWidth, img.naturalHeight));
      const faces = await detectFaces(img);
      totalFaces += faces.length;
      faces.forEach((box) => blurBoxOnCanvas(ctx, clean, box, strength));
      const blob = await CZImage.exportCanvas(canvas, "image/png");
      queueFile(blob, `${CZImage.baseName(file)}-faces-blurred.png`, "image/png");
      setStatus(`Blurred ${faces.length} face(s) in image ${i + 1}/${files.length} at ${blurPercent()}%...`);
    }
    if (!totalFaces) {
      setStatus("No faces detected. Switch to Manual brush to paint areas to blur.", "error");
    }
  }

  async function openManualEditor() {
    if (!files.length) return;
    setStatus("Paint over areas to blur...");
    const img = await CZImage.loadImage(files[0]);
    const maxW = Math.min(900, img.naturalWidth);
    const scale = maxW / img.naturalWidth;
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const source = document.createElement("canvas");
    source.width = img.naturalWidth;
    source.height = img.naturalHeight;
    source.getContext("2d").drawImage(img, 0, 0);

    const keepMask =
      manual.mask &&
      manual.mask.width === img.naturalWidth &&
      manual.mask.height === img.naturalHeight
        ? manual.mask
        : null;

    const mask = keepMask || document.createElement("canvas");
    if (!keepMask) {
      mask.width = img.naturalWidth;
      mask.height = img.naturalHeight;
    }

    const display = document.createElement("canvas");
    display.width = w;
    display.height = h;
    display.className = "blur-canvas";

    manual = { source, mask, display, painting: false, scale };

    const panel = document.getElementById("resultPreview");
    const stage = document.getElementById("previewStage");
    if (!panel || !stage) return;
    panel.hidden = false;
    const head = panel.querySelector(".preview-head h3");
    if (head) head.textContent = "Manual blur";
    stage.innerHTML = `<p class="editor-hint">Paint areas to blur. Adjust brush size above.</p><div class="blur-editor" id="blurEditor"></div>`;
    document.getElementById("blurEditor").appendChild(display);

    await refreshManualPreview();
    bindBrush(display);
    setStatus("Paint areas to blur, then download.", "ok");
  }

  async function refreshManualPreview() {
    if (!manual.source || !manual.mask || !manual.display) return;
    const strength = blurStrength(Math.max(manual.source.width, manual.source.height));
    const result = applyMaskBlur(manual.source, manual.mask, strength);
    const dctx = manual.display.getContext("2d");
    dctx.clearRect(0, 0, manual.display.width, manual.display.height);
    dctx.drawImage(result, 0, 0, manual.display.width, manual.display.height);

    const overlay = document.createElement("canvas");
    overlay.width = manual.display.width;
    overlay.height = manual.display.height;
    const octx = overlay.getContext("2d");
    octx.drawImage(manual.mask, 0, 0, overlay.width, overlay.height);
    octx.globalCompositeOperation = "source-in";
    octx.fillStyle = "rgba(255, 80, 120, 0.22)";
    octx.fillRect(0, 0, overlay.width, overlay.height);
    dctx.drawImage(overlay, 0, 0);

    const blob = await CZImage.exportCanvas(result, "image/png");
    pendingFiles = [{ blob, name: `${CZImage.baseName(files[0])}-blurred.png` }];
    setDownloadEnabled(true);
  }

  function bindBrush(canvas) {
    const paintAt = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * manual.mask.width;
      const y = ((e.clientY - rect.top) / rect.height) * manual.mask.height;
      const r = (brushSize() / manual.scale) / 2;
      const ctx = manual.mask.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(4, r), 0, Math.PI * 2);
      ctx.fill();
    };

    const onDown = (e) => {
      e.preventDefault();
      manual.painting = true;
      paintAt(e.touches ? e.touches[0] : e);
      refreshManualPreview();
    };
    const onMove = (e) => {
      if (!manual.painting) return;
      e.preventDefault();
      paintAt(e.touches ? e.touches[0] : e);
      refreshManualPreview();
    };
    const onUp = () => {
      manual.painting = false;
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp);
  }

  async function convertImages(mime, ext, quality = 0.92) {
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const canvas = CZImage.resizeCanvas(img, img.naturalWidth, img.naturalHeight, false);
      let outCanvas = canvas;
      if (mime === "image/jpeg") {
        outCanvas = document.createElement("canvas");
        outCanvas.width = canvas.width;
        outCanvas.height = canvas.height;
        const ctx = outCanvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
        ctx.drawImage(canvas, 0, 0);
      }
      const blob = await CZImage.exportCanvas(outCanvas, mime, quality);
      queueFile(blob, `${CZImage.baseName(file)}.${ext}`, mime);
    }
  }

  function compressTargetBytes() {
    const amount = Math.max(1, Number(document.getElementById("targetSize")?.value || 200));
    const unit = document.getElementById("targetUnit")?.value || "kb";
    return Math.round(amount * (unit === "mb" ? 1024 * 1024 : 1024));
  }

  async function compressImages() {
    const mode = document.getElementById("compressMode")?.value || "quality";
    const quality = Number(document.getElementById("quality")?.value || 0.8);
    const targetBytes = compressTargetBytes();
    const notes = [];

    for (const file of files) {
      const source = await CZImage.loadBitmap(file);
      const size = {
        width: source.naturalWidth || source.width,
        height: source.naturalHeight || source.height,
      };
      // Keep full frame. White fill only under transparent pixels for JPEG (never crops/removes objects).
      const canvas = CZImage.imageToCanvas(source, size.width, size.height, "#ffffff");
      if (typeof source.close === "function") source.close();

      let blob;
      let detail = "";
      if (mode === "size") {
        const result = await CZImage.compressToTarget(canvas, targetBytes);
        blob = result.blob;
        const scalePct = Math.round((result.scale || 1) * 100);
        detail = `${CZImage.formatBytes(file.size)} → ${CZImage.formatBytes(blob.size)} (target ${CZImage.formatBytes(targetBytes)}${scalePct < 100 ? `, resized to ${scalePct}%` : ""})`;
      } else {
        blob = await CZImage.encodeJpeg(canvas, quality, 1);
        detail = `${CZImage.formatBytes(file.size)} → ${CZImage.formatBytes(blob.size)} (quality ${Math.round(quality * 100)}%)`;
      }

      notes.push(`${file.name}: ${detail}`);
      queueFile(blob, `${CZImage.baseName(file)}-compressed.jpg`, "image/jpeg");
    }

    if (notes.length === 1) return `${notes[0]}. Ready to download.`;
    return `${notes.length} images compressed. Ready to download.`;
  }

  async function resizeImages() {
    const width = Number(document.getElementById("width").value || 0) || null;
    const height = Number(document.getElementById("height").value || 0) || null;
    const keepRatio = document.getElementById("keepRatio").checked;
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const canvas =
        !width && !height
          ? CZImage.resizeCanvas(img, img.naturalWidth, img.naturalHeight, false)
          : CZImage.resizeCanvas(img, width, height, keepRatio);
      const blob = await CZImage.exportCanvas(canvas, "image/jpeg", 0.92);
      queueFile(blob, `${CZImage.baseName(file)}-resized.jpg`, "image/jpeg");
    }
  }

  async function cropImages() {
    const x = Math.max(0, Number(document.getElementById("cropX").value || 0));
    const y = Math.max(0, Number(document.getElementById("cropY").value || 0));
    const w = Math.max(1, Number(document.getElementById("cropW").value || 1));
    const h = Math.max(1, Number(document.getElementById("cropH").value || 1));
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const cw = Math.min(w, img.naturalWidth - x);
      const ch = Math.min(h, img.naturalHeight - y);
      if (cw < 1 || ch < 1) throw new Error("Crop area is outside the image.");
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      canvas.getContext("2d").drawImage(img, x, y, cw, ch, 0, 0, cw, ch);
      const blob = await CZImage.exportCanvas(canvas, "image/png");
      queueFile(blob, `${CZImage.baseName(file)}-cropped.png`, "image/png");
    }
  }

  async function rotateImages() {
    const angle = Number(document.getElementById("angle").value || 90);
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * cos + h * sin);
      canvas.height = Math.round(w * sin + h * cos);
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -w / 2, -h / 2);
      const blob = await CZImage.exportCanvas(canvas, "image/png");
      queueFile(blob, `${CZImage.baseName(file)}-rotated.png`, "image/png");
    }
  }

  async function flipImages() {
    const dir = document.getElementById("flipDir").value || "h";
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (dir === "v") {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      } else {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await CZImage.exportCanvas(canvas, "image/png");
      queueFile(blob, `${CZImage.baseName(file)}-flipped.png`, "image/png");
    }
  }

  async function effectImages(kind) {
    for (const file of files) {
      const img = await CZImage.loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (kind === "grayscale") ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0);
      const blob = await CZImage.exportCanvas(canvas, "image/png");
      queueFile(blob, `${CZImage.baseName(file)}-${kind}.png`, "image/png");
    }
  }

  async function showWorkingPreview() {
    if (!files[0]) return;
    const panel = document.getElementById("resultPreview");
    const stage = document.getElementById("previewStage");
    if (!panel || !stage) return;
    const head = panel.querySelector(".preview-head h3");
    if (head) head.textContent = "Preview";
    panel.hidden = false;
    const url = URL.createObjectURL(files[0]);
    stage.innerHTML = `<img class="preview-image" src="${url}" alt="Working preview" />`;
  }

  function workerGoneError() {
    const error = new Error("Background remover is unavailable in this browser.");
    error.workerUnavailable = true;
    return error;
  }

  function ensureBackgroundWorker() {
    if (bgRemovalWorker) return bgRemovalWorker;
    if (bgWorkerBroken || !window.Worker || !toolsScriptUrl) return null;

    try {
      const workerUrl = new URL("bg-remove-worker.js", toolsScriptUrl).href;
      bgRemovalWorker = new Worker(workerUrl, { type: "module" });
    } catch (error) {
      bgWorkerBroken = true;
      return null;
    }

    bgRemovalWorker.addEventListener("message", (event) => {
      const message = event.data || {};
      if (message.type === "ready") return;
      const job = bgWorkerJobs.get(message.id);
      if (!job) return;
      if (message.type === "progress") {
        job.onProgress?.(message.key, message.current, message.total);
      } else if (message.type === "result") {
        bgWorkerJobs.delete(message.id);
        job.resolve(new Blob([message.buffer], { type: message.mime || "image/png" }));
      } else if (message.type === "error") {
        bgWorkerJobs.delete(message.id);
        if (message.fallback) {
          // The worker cannot load the model here, so stop using it and finish on the page itself.
          bgWorkerBroken = true;
          job.reject(workerGoneError());
        } else {
          job.reject(new Error(message.error || "Could not remove this background."));
        }
      }
    });

    bgRemovalWorker.addEventListener("error", (event) => {
      event.preventDefault?.();
      bgWorkerBroken = true;
      bgWorkerJobs.forEach((job) => job.reject(workerGoneError()));
      bgWorkerJobs.clear();
      bgRemovalWorker?.terminate();
      bgRemovalWorker = null;
    });

    return bgRemovalWorker;
  }

  function callBackgroundWorker(payload, buffer, onProgress) {
    const worker = ensureBackgroundWorker();
    if (!worker) return Promise.reject(workerGoneError());
    return new Promise((resolve, reject) => {
      const id = ++bgWorkerSequence;
      bgWorkerJobs.set(id, { resolve, reject, onProgress });
      worker.postMessage({ ...payload, id, buffer }, [buffer]);
    });
  }

  function backgroundMaxSide() {
    // The model works on a fixed internal size, so a smaller export keeps quality but cuts the wait.
    return window.matchMedia("(max-width: 700px), (pointer: coarse)").matches ? 1440 : 2048;
  }

  function loadRemoverOnMainThread() {
    if (!mainThreadRemover) {
      mainThreadRemover = (async () => {
        const sources = [
          "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm",
          "https://unpkg.com/@imgly/background-removal@1.5.8/dist/index.mjs",
        ];
        let lastError = null;
        for (const source of sources) {
          try {
            const module = await import(source);
            const remove = module.removeBackground || module.default;
            if (typeof remove === "function") return remove;
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError || new Error("Could not load the background remover.");
      })();
    }
    return mainThreadRemover;
  }

  function breathe() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  async function drawScaled(blob, maxSide, type, quality) {
    const img = await CZImage.loadImage(blob);
    const largest = Math.max(img.naturalWidth, img.naturalHeight);
    if (!maxSide || largest <= maxSide) return blob;

    const scale = maxSide / largest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return CZImage.exportCanvas(canvas, type || "image/png", quality);
  }

  async function refineEdgesOnMainThread(blob) {
    const img = await CZImage.loadImage(blob);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    let seen = 0;
    for (let i = 3; i < data.length; i += 4) {
      // Yielding every few hundred thousand pixels keeps the page usable on slower machines.
      if ((seen += 1) % 300000 === 0) await breathe();
      const alpha = data[i];
      if (alpha === 0 || alpha === 255) continue;
      data[i] = alpha <= 10 ? 0 : alpha >= 245 ? 255 : Math.round(((alpha - 10) * 255) / 235);
    }
    ctx.putImageData(image, 0, 0);
    return CZImage.exportCanvas(canvas, "image/png");
  }

  async function paintBackgroundOnMainThread(blob, color) {
    const img = await CZImage.loadImage(blob);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return CZImage.exportCanvas(canvas, "image/png");
  }

  async function cutOutOnMainThread(file, onProgress) {
    const removeBackground = await loadRemoverOnMainThread();
    const source = await drawScaled(file, backgroundMaxSide(), "image/jpeg", 0.95);
    const attempts = [
      { device: "cpu", model: "isnet_fp16" },
      { device: "cpu", model: "isnet_quint8" },
    ];
    let lastError = null;
    for (const attempt of attempts) {
      try {
        const result = await removeBackground(source, {
          publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.5.8/dist/",
          device: attempt.device,
          model: attempt.model,
          output: { format: "image/png", type: "foreground" },
          progress: onProgress,
        });
        return refineEdgesOnMainThread(result);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Could not remove this background.");
  }

  function reportBackgroundProgress(index, key, current, total) {
    const percent = total ? Math.round((current / total) * 100) : 0;
    if (String(key || "").startsWith("fetch")) {
      setStatus(`Getting the AI model ready (${percent}%). This happens only on the first run.`);
    } else {
      setStatus(`Removing background ${index + 1} of ${files.length}... ${percent}%`);
    }
  }

  async function removeBackgrounds() {
    setStatus("Starting the background remover...");
    await showWorkingPreview();
    await breathe();

    cutouts = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const onProgress = (key, current, total) => reportBackgroundProgress(i, key, current, total);
      setStatus(`Removing background ${i + 1} of ${files.length}...`);

      let blob;
      try {
        const buffer = await file.arrayBuffer();
        blob = await callBackgroundWorker(
          { type: "remove", mime: file.type || "image/png", maxSide: backgroundMaxSide() },
          buffer,
          onProgress
        );
      } catch (error) {
        if (!error?.workerUnavailable) throw error;
        blob = await cutOutOnMainThread(file, onProgress);
      }

      cutouts.push({ blob, base: CZImage.baseName(file) });
    }
  }

  async function applyBackgroundToCutouts() {
    pendingFiles = [];
    previewHtml = "";

    for (const cut of cutouts) {
      if (bgColor === "transparent") {
        queueFile(cut.blob, `${cut.base}-no-bg.png`, "image/png");
        continue;
      }

      let blob;
      try {
        const buffer = await cut.blob.arrayBuffer();
        blob = await callBackgroundWorker({ type: "compose", mime: "image/png", color: bgColor }, buffer);
      } catch (error) {
        if (!error?.workerUnavailable) throw error;
        blob = await paintBackgroundOnMainThread(cut.blob, bgColor);
      }
      queueFile(blob, `${cut.base}-bg.png`, "image/png");
    }

    if (pendingFiles[0] && (pendingFiles[0].blob.type || "").startsWith("image/")) {
      const check = bgColor === "transparent" ? " is-checkered" : "";
      previewHtml = `<img class="preview-image${check}" src="${URL.createObjectURL(pendingFiles[0].blob)}" alt="Preview" />`;
    }
  }

  async function ensureImageTracer() {
    if (window.ImageTracer) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Could not load SVG converter. Check your internet and try again."));
      document.head.appendChild(s);
    });
  }

  async function imagesToSvg() {
    setStatus("Loading SVG converter...");
    await ensureImageTracer();
    const colors = Number(document.getElementById("svgDetail")?.value || 16);
    const maxSide = 900;

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setStatus(`Converting to SVG ${i + 1} of ${files.length}...`);
      const img = await CZImage.loadImage(file);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const imageData = canvas.getContext("2d").getImageData(0, 0, w, h);

      const svgstr = window.ImageTracer.imagedataToSVG(imageData, {
        numberofcolors: colors,
        pathomit: colors <= 8 ? 12 : colors <= 16 ? 8 : 4,
        ltres: 1,
        qtres: 1,
        scale: 1,
        strokewidth: 0,
        blurradius: colors >= 32 ? 0 : 1,
        blurdelta: 20,
      });

      const blob = new Blob([svgstr], { type: "image/svg+xml;charset=utf-8" });
      queueFile(blob, `${CZImage.baseName(file)}.svg`, "image/svg+xml");
      if (i === 0) {
        previewHtml = `<div class="preview-svg">${svgstr}</div>`;
      }
    }
  }

  async function imagesToPdf() {
    if (typeof PDFLib === "undefined") throw new Error("PDF library missing. Refresh the page.");
    const { PDFDocument } = PDFLib;
    const out = await PDFDocument.create();
    const thumbs = [];
    for (const file of files) {
      const source = await CZImage.loadBitmap(file);
      const size = {
        width: source.naturalWidth || source.width,
        height: source.naturalHeight || source.height,
      };
      const canvas = CZImage.imageToCanvas(source, size.width, size.height, "#ffffff");
      if (typeof source.close === "function") source.close();
      const isPng = (file.type || "").includes("png");
      const blob = await CZImage.exportCanvas(canvas, isPng ? "image/png" : "image/jpeg", 0.92);
      const thumbUrl = URL.createObjectURL(blob);
      thumbs.push({ name: file.name, url: thumbUrl });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const embedded = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);
      const page = out.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }
    queueFile(await out.save(), "images.pdf", "application/pdf");
    previewHtml = `<div class="preview-file-card preview-file-card--pdf">
        <strong>${files.length} image${files.length === 1 ? "" : "s"} → 1 PDF</strong>
        <span>images.pdf</span>
        <em>Preview pages below, then download</em>
      </div>
      <div class="preview-gallery">${thumbs
        .map(
          (item, index) => `
          <figure class="preview-gallery-item">
            <img class="preview-image" src="${item.url}" alt="Page ${index + 1}" />
            <figcaption>Page ${index + 1}: ${item.name}</figcaption>
          </figure>`
        )
        .join("")}</div>`;
  }

  async function ensureTesseract() {
    if (!window.Tesseract) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
        s.onload = resolve;
        s.onerror = () => reject(new Error("Could not load the text recognition engine. Check your internet and try again."));
        document.head.appendChild(s);
      });
    }
    if (!ocrWorker) {
      setStatus("Preparing text recognition (first run downloads a language file)...");
      ocrWorker = window.Tesseract.createWorker("eng").catch((err) => {
        ocrWorker = null;
        throw new Error(err?.message || "Could not start text recognition.");
      });
    }
    return ocrWorker;
  }

  function ocrWordsFrom(data) {
    if (Array.isArray(data.blocks) && data.blocks.length) {
      return data.blocks
        .flatMap((block) => block.paragraphs || [])
        .flatMap((paragraph) => paragraph.lines || [])
        .flatMap((line) => line.words || []);
    }
    return data.words || [];
  }

  async function readPdfTextItems(page) {
    const content = await page.getTextContent({ normalizeWhitespace: true });
    return content.items
      .filter((item) => item.str && item.str.trim())
      .map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        size: Math.max(8, Math.hypot(item.transform[2], item.transform[3]) || item.height || 11),
      }));
  }

  async function readScannedPageItems(page, viewport) {
    const worker = await ensureTesseract();
    const scale = Math.min(3, Math.max(1.6, 1700 / Math.max(viewport.width, viewport.height)));
    const scaled = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(scaled.width);
    canvas.height = Math.round(scaled.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: scaled }).promise;

    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    return ocrWordsFrom(data)
      .filter((word) => word.text && word.text.trim() && (word.confidence ?? 100) >= 40)
      .map((word) => {
        const box = word.bbox || {};
        const left = (box.x0 || 0) / scale;
        const right = (box.x1 || 0) / scale;
        const top = (box.y0 || 0) / scale;
        const bottom = (box.y1 || 0) / scale;
        return {
          text: word.text,
          x: left,
          // Canvas coordinates start at the top; PDF text coordinates start at the bottom.
          y: viewport.height - bottom,
          width: Math.max(0, right - left),
          size: Math.max(8, (bottom - top) * 1.15),
          ocr: true,
        };
      });
  }

  async function pdfToWord() {
    if (!window.pdfjsLib || !window.docx) {
      throw new Error("PDF to Word libraries are missing. Refresh the page and try again.");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const file = files[0];
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const sections = [];
    const previewPages = [];
    let extractedCharacters = 0;
    let scannedPages = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`Converting page ${pageNumber} of ${pdf.numPages}...`);
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      let items = await readPdfTextItems(page);

      if (!items.length) {
        setStatus(`Scanned page detected. Reading text from page ${pageNumber} of ${pdf.numPages}...`);
        items = await readScannedPageItems(page, viewport);
        if (items.length) scannedPages += 1;
      }

      extractedCharacters += items.reduce((total, item) => total + item.text.length, 0);
      items.sort((a, b) => b.y - a.y || a.x - b.x);

      const lines = [];
      for (const item of items) {
        let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= Math.max(2, item.size * 0.35));
        if (!line) {
          line = { y: item.y, items: [] };
          lines.push(line);
        }
        line.items.push(item);
      }
      lines.sort((a, b) => b.y - a.y);

      let previousY = viewport.height;
      const children = lines.map((line) => {
        line.items.sort((a, b) => a.x - b.x);
        const runs = [];
        let rightEdge = 0;

        line.items.forEach((item, index) => {
          const gap = index === 0 ? 0 : item.x - rightEdge;
          // Recognised words never carry their own spacing, so they always need a separator.
          const minGap = item.ocr ? 0 : item.size * 0.35;
          const spacer = gap > item.size * 1.4 ? "    " : index > 0 && gap > minGap ? " " : "";
          runs.push(
            new docx.TextRun({
              text: spacer + item.text,
              size: Math.max(16, Math.min(96, Math.round(item.size * 2))),
            })
          );
          rightEdge = Math.max(rightEdge, item.x + item.width);
        });

        const verticalGap = Math.max(0, previousY - line.y);
        previousY = line.y;
        return new docx.Paragraph({
          children: runs,
          indent: { left: Math.max(0, Math.round((line.items[0]?.x || 0) * 20)) },
          spacing: {
            before: Math.max(0, Math.min(480, Math.round((verticalGap - (line.items[0]?.size || 11)) * 20))),
            after: 0,
            line: Math.max(200, Math.round((line.items[0]?.size || 11) * 22)),
          },
        });
      });

      if (!children.length) {
        children.push(new docx.Paragraph({ children: [new docx.TextRun(" ")] }));
      }

      previewPages.push({
        number: pageNumber,
        width: viewport.width,
        height: viewport.height,
        items: items.map((item) => ({
          text: item.text,
          x: item.x,
          top: viewport.height - item.y - item.size * 0.82,
          size: item.size,
        })),
      });

      const isLandscape = viewport.width > viewport.height;
      sections.push({
        properties: {
          type: pageNumber === 1 ? undefined : docx.SectionType.NEXT_PAGE,
          page: {
            size: {
              // docx swaps explicit dimensions when landscape is selected.
              width: Math.round((isLandscape ? viewport.height : viewport.width) * 20),
              height: Math.round((isLandscape ? viewport.width : viewport.height) * 20),
              orientation: isLandscape ? docx.PageOrientation.LANDSCAPE : docx.PageOrientation.PORTRAIT,
            },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children,
      });
    }

    if (!extractedCharacters) {
      throw new Error("No readable text was found in this PDF. Try a clearer scan or a higher quality file.");
    }

    const documentFile = new docx.Document({ sections });
    const blob = await docx.Packer.toBlob(documentFile);
    queueFile(blob, `${CZImage.baseName(file)}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    previewHtml = buildDocumentPreview(previewPages, scannedPages);
  }

  function buildDocumentPreview(pages, scannedPages) {
    const shown = pages.slice(0, 5);
    const pagesHtml = shown
      .map((page) => {
        const scale = Math.min(1, 640 / page.width);
        const words = page.items
          .map(
            (item) =>
              `<span class="docx-word" style="left:${(item.x * scale).toFixed(2)}px;top:${(item.top * scale).toFixed(
                2
              )}px;font-size:${Math.max(4, item.size * scale).toFixed(2)}px">${escapeHtml(item.text)}</span>`
          )
          .join("");
        return `<figure class="docx-page-wrap">
            <div class="docx-page" style="width:${(page.width * scale).toFixed(2)}px;height:${(page.height * scale).toFixed(2)}px">${words}</div>
            <figcaption>Page ${page.number}</figcaption>
          </figure>`;
      })
      .join("");

    const notes = [];
    if (pages.length > shown.length) {
      notes.push(`Showing the first ${shown.length} of ${pages.length} pages. All pages are in the download.`);
    }
    if (scannedPages) {
      notes.push(`${scannedPages} scanned page(s) were read with text recognition, so check them for small mistakes.`);
    }

    return `<div class="docx-preview">
        <div class="docx-pages">${pagesHtml}</div>
        ${notes.length ? `<p class="docx-preview-note">${escapeHtml(notes.join(" "))}</p>` : ""}
      </div>`;
  }

  async function wordToPdf() {
    if (!window.mammoth || typeof window.html2pdf !== "function") {
      throw new Error("Word to PDF libraries are missing. Refresh the page and try again.");
    }

    const file = files[0];
    if (!file) throw new Error("Choose a Word .docx file first.");
    if (!/\.docx$/i.test(file.name || "")) {
      throw new Error("Please upload a .docx Word file.");
    }

    setStatus("Reading Word document...");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = (result.value || "").trim();
    if (!html) {
      throw new Error("No readable content was found in this Word file.");
    }

    const warnings = (result.messages || [])
      .filter((msg) => msg?.type === "warning")
      .slice(0, 3)
      .map((msg) => msg.message);

    const host = document.createElement("div");
    host.className = "word-pdf-render";
    host.innerHTML = html;
    document.body.appendChild(host);

    setStatus("Building PDF preview...");
    const base = CZImage.baseName(file);
    try {
      const pdfBlob = await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${base}.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(host)
        .outputPdf("blob");

      queueFile(pdfBlob, `${base}.pdf`, "application/pdf");
      previewHtml = `<div class="word-pdf-preview">
          <div class="preview-file-card preview-file-card--pdf">
            <strong>Word → PDF</strong>
            <span>${escapeHtml(base)}.pdf</span>
            <em>Preview the document below, then download</em>
          </div>
          <article class="word-pdf-page">${html}</article>
          ${
            warnings.length
              ? `<p class="docx-preview-note">${escapeHtml(
                  "Some formatting may look slightly different in the PDF."
                )}</p>`
              : ""
          }
        </div>`;
    } finally {
      host.remove();
    }
  }
})();
