(() => {
  const app = document.getElementById("pdfFormApp");
  if (!app) return;

  const start = document.getElementById("pdfFormStart");
  const editor = document.getElementById("pdfFormEditor");
  const drop = document.getElementById("pdfFormDrop");
  const input = document.getElementById("pdfFormInput");
  const blankBtn = document.getElementById("pdfBlankBtn");
  const toolbar = document.getElementById("pdfFormToolbar");
  const pagesEl = document.getElementById("pdfPages");
  const pagesScroll = document.querySelector(".pdf-pages-scroll");
  const floatBar = document.getElementById("pdfFieldFloatBar");
  const floatBarInner = document.getElementById("pdfFieldFloatBarInner");
  const floatMore = document.getElementById("pdfFieldFloatMore");
  const orderDialog = document.getElementById("pdfOrderDialog");
  const orderList = document.getElementById("pdfOrderList");
  const statusEl = document.getElementById("pdfFormStatus");
  const hintEl = document.getElementById("pdfEditorHint");
  const undoBtn = document.getElementById("pdfUndoBtn");
  const redoBtn = document.getElementById("pdfRedoBtn");
  const renameDialog = document.getElementById("pdfRenameDialog");
  const renameForm = document.getElementById("pdfRenameForm");
  const downloadNameInput = document.getElementById("pdfDownloadName");
  const renameError = document.getElementById("pdfRenameError");
  const signatureDialog = document.getElementById("pdfSignatureDialog");
  const signatureName = document.getElementById("pdfSignatureName");
  const signatureStyles = document.getElementById("pdfSignatureStyles");
  const signatureImageInput = document.getElementById("pdfSignatureImage");
  const uploadedSignature = document.getElementById("pdfUploadedSignature");
  const signatureError = document.getElementById("pdfSignatureError");
  const useSignatureBtn = document.getElementById("pdfUseSignature");

  if (typeof pdfjsLib !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  let sourceBytes = null;
  let sourcePdf = null;
  let pages = [];
  let fields = [];
  let selectedId = null;
  let activeTool = null;
  let zoom = 1;
  let nextId = 1;
  let history = [];
  let future = [];
  let renderToken = 0;
  let sourceFileName = "document.pdf";
  let pendingPublish = false;
  let signatureChoice = null;
  let signatureDataUrl = "";
  let signatureAspect = 3.2;
  let signatureEditFieldId = null;
  let manualZoom = false;
  let resizeTimer = null;
  let signaturePreviewToken = 0;
  let signatureRenderTimer = null;
  const signatureCache = new Map();

  const fieldTypes = new Set(["text", "textarea", "radio", "checkbox", "dropdown"]);
  const labels = {
    label: "Label",
    whiteout: "Whiteout",
    text: "Text Field",
    textarea: "Textarea",
    radio: "Radio",
    checkbox: "Checkbox",
    dropdown: "Dropdown",
    signature: "Signature",
  };
  const signatureFonts = [
    "Great Vibes",
    "Allura",
    "Alex Brush",
    "Parisienne",
    "Sacramento",
    "Tangerine",
    "Dancing Script",
    "Pacifico",
    "Satisfy",
    "Caveat",
    "Marck Script",
    "Yellowtail",
    "Homemade Apple",
    "Pinyon Script",
    "Italianno",
  ];

  function setStatus(message, type = "") {
    statusEl.textContent = message || "";
    statusEl.className = "status" + (type ? ` ${type}` : "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function snapshot() {
    return JSON.stringify({ pages, fields, nextId });
  }

  function remember() {
    history.push(snapshot());
    if (history.length > 40) history.shift();
    future = [];
    updateHistoryButtons();
  }

  function restore(data) {
    const state = JSON.parse(data);
    pages = state.pages;
    fields = state.fields;
    nextId = state.nextId;
    selectedId = null;
    renderPages();
    updateFieldUI();
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    undoBtn.disabled = history.length === 0;
    redoBtn.disabled = future.length === 0;
  }

  async function loadPdf(file) {
    if (!file || !/\.pdf$/i.test(file.name || "")) {
      setStatus("Please choose a PDF file.", "error");
      return;
    }
    if (typeof pdfjsLib === "undefined") {
      setStatus("PDF viewer failed to load. Check your connection and refresh.", "error");
      return;
    }
    try {
      setStatus("Opening PDF...");
      const buffer = await file.arrayBuffer();
      sourceBytes = new Uint8Array(buffer);
      sourcePdf = await pdfjsLib.getDocument({ data: sourceBytes.slice() }).promise;
      sourceFileName = file.name;
      pages = [];
      for (let index = 0; index < sourcePdf.numPages; index += 1) {
        const page = await sourcePdf.getPage(index + 1);
        const viewport = page.getViewport({ scale: 1 });
        pages.push({
          id: `page-${nextId++}`,
          sourceIndex: index,
          width: viewport.width,
          height: viewport.height,
        });
      }
      fields = [];
      history = [];
      future = [];
      openEditor();
      setStatus(`${pages.length} page(s) ready. Add fields from the toolbar.`, "ok");
    } catch (error) {
      setStatus(error?.message || "Could not open this PDF.", "error");
    }
  }

  function createBlank() {
    sourceBytes = null;
    sourcePdf = null;
    sourceFileName = "blank-form.pdf";
    pages = [{ id: `page-${nextId++}`, sourceIndex: null, width: 595.28, height: 841.89 }];
    fields = [];
    history = [];
    future = [];
    openEditor();
    setStatus("Blank A4 document ready.", "ok");
  }

  function useSystemCursor() {
    // The decorative cursor makes precise field placement hard, so the editor uses the normal pointer.
    document.documentElement.classList.add("pdf-plain-cursor");
  }

  function fitZoomToWidth() {
    const available = ((pagesScroll || pagesEl).clientWidth || window.innerWidth * 0.88) - 48;
    const widest = pages.reduce((largest, page) => Math.max(largest, page.width), 1);
    if (available <= 0) return;
    zoom = Math.max(0.45, Math.min(2.5, Number((available / widest).toFixed(2))));
  }

  function openEditor() {
    start.hidden = true;
    editor.hidden = false;
    useSystemCursor();
    manualZoom = false;
    fitZoomToWidth();
    renderPages();
    updateFieldUI();
    updateHistoryButtons();
  }

  function updateFieldUI() {
    renderFieldOverlays();
    renderFloatingToolbar();
  }

  function selectField(fieldId) {
    selectedId = fieldId;
    document.querySelectorAll(".pdf-placed-field").forEach((node) => {
      node.classList.toggle("is-selected", node.dataset.fieldId === fieldId);
    });
    renderFloatingToolbar();
  }

  function patchFieldPreview(field) {
    const element = document.querySelector(`.pdf-placed-field[data-field-id="${field.id}"]`);
    if (!element) return;
    element.style.width = `${field.width * zoom}px`;
    element.style.height = `${field.height * zoom}px`;
    element.style.setProperty("--field-border", field.showBorder ? field.borderColor : "transparent");
    element.style.setProperty("--field-text", field.textColor);
    element.style.setProperty(
      "--field-bg",
      field.type === "whiteout" ? "#ffffff" : field.filledBackground ? field.backgroundColor : "transparent"
    );
    element.querySelectorAll(":scope > :not(.pdf-field-resize)").forEach((node) => node.remove());
    const wrap = document.createElement("div");
    wrap.innerHTML = fieldPreview(field);
    const firstHandle = element.querySelector(".pdf-field-resize");
    while (wrap.firstChild) element.insertBefore(wrap.firstChild, firstHandle);
    const sizeEl = floatBarInner?.querySelector(".pdf-float-size");
    if (sizeEl) sizeEl.textContent = String(field.fontSize);
  }

  function trimTransparent(canvas, padding = 10) {
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let top = canvas.height;
    let left = canvas.width;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (data[(y * canvas.width + x) * 4 + 3] < 8) continue;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    if (right < 0) return canvas;

    left = Math.max(0, left - padding);
    top = Math.max(0, top - padding);
    right = Math.min(canvas.width - 1, right + padding);
    bottom = Math.min(canvas.height - 1, bottom + padding);

    const trimmed = document.createElement("canvas");
    trimmed.width = right - left + 1;
    trimmed.height = bottom - top + 1;
    trimmed.getContext("2d").drawImage(canvas, left, top, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
    return trimmed;
  }

  function ensureSignatureFonts(name) {
    if (!document.fonts?.load) return Promise.resolve();
    return Promise.all(
      signatureFonts.map((font) => document.fonts.load(`120px "${font}"`, name).catch(() => {}))
    );
  }

  async function buildTypedSignature(name, font) {
    const key = `${font}|${name}`;
    if (signatureCache.has(key)) return signatureCache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    let size = 170;
    ctx.font = `${size}px "${font}", cursive`;
    while (ctx.measureText(name).width > canvas.width - 80 && size > 24) {
      size -= 6;
      ctx.font = `${size}px "${font}", cursive`;
    }

    ctx.fillStyle = "#0f1a16";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    const trimmed = trimTransparent(canvas, 14);
    const signature = {
      dataUrl: trimmed.toDataURL("image/png"),
      width: trimmed.width,
      height: trimmed.height,
    };
    signatureCache.set(key, signature);
    return signature;
  }

  async function renderSignatureChoices() {
    const token = ++signaturePreviewToken;
    const name = signatureName.value.trim();
    if (!name) {
      signatureStyles.innerHTML = '<p class="pdf-sign-help">Enter your name above to see the signature styles.</p>';
      return;
    }

    await ensureSignatureFonts(name);
    if (token !== signaturePreviewToken) return;

    const previews = await Promise.all(signatureFonts.map((font) => buildTypedSignature(name, font)));
    if (token !== signaturePreviewToken) return;

    signatureStyles.innerHTML = previews
      .map(
        (preview, index) => `<button type="button" class="pdf-signature-style${
          signatureChoice?.kind === "typed" && signatureChoice.index === index ? " is-selected" : ""
        }" data-sign-index="${index}" title="Signature style ${index + 1}">
          <img src="${preview.dataUrl}" alt="Signature style ${index + 1}" />
        </button>`
      )
      .join("");

    signatureStyles.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        signatureChoice = { kind: "typed", index: Number(button.dataset.signIndex) };
        signatureError.textContent = "";
        useSignatureBtn.disabled = false;
        signatureStyles.querySelectorAll("button").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
        });
      });
    });
  }

  function openSignatureCreator(editFieldId = null) {
    signatureEditFieldId = typeof editFieldId === "string" ? editFieldId : null;
    signatureChoice = null;
    signatureError.textContent = "";
    signatureName.value = "";
    signatureImageInput.value = "";
    uploadedSignature.hidden = true;
    uploadedSignature.querySelector("img").removeAttribute("src");
    useSignatureBtn.disabled = true;
    document.querySelectorAll("[data-sign-tab]").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.signTab === "type");
    });
    document.querySelectorAll("[data-sign-pane]").forEach((pane) => {
      pane.hidden = pane.dataset.signPane !== "type";
    });
    renderSignatureChoices().catch(() => {});
    signatureDialog.showModal();
    requestAnimationFrame(() => signatureName.focus());
  }

  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read this signature image."));
      };
      img.src = url;
    });
  }

  function keyOutPaper(canvas) {
    const ctx = canvas.getContext("2d");
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;

    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) transparentPixels += 1;
    }
    // A photo or scan of paper is fully opaque. If the file already has transparency, leave it alone.
    if (transparentPixels > data.length / 4 / 100) return canvas;

    const paper = 240;
    const ink = 110;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance >= paper) {
        data[i + 3] = 0;
      } else if (luminance > ink) {
        data[i + 3] = Math.round(((paper - luminance) / (paper - ink)) * 255);
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  async function prepareUploadedSignature(file) {
    const img = await loadImageFile(file);
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

    const trimmed = trimTransparent(keyOutPaper(canvas), 6);
    return {
      dataUrl: trimmed.toDataURL("image/png"),
      width: trimmed.width,
      height: trimmed.height,
    };
  }

  function selectTool(tool) {
    activeTool = activeTool === tool ? null : tool;
    selectedId = null;
    toolbar.querySelectorAll("[data-tool]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tool === activeTool);
    });
    hintEl.textContent = activeTool
      ? `${labels[activeTool]} selected — click and drag on a page to place it. Press Esc to cancel.`
      : "Choose a field above, then click and drag on a page to place it.";
    updateFieldUI();
  }

  function nextFieldLabel(type) {
    const labelsByType = {
      text: "Text",
      textarea: "Textarea",
      radio: "Radio",
      checkbox: "Checkbox",
      dropdown: "Dropdown",
      signature: "Signature",
      label: "Label",
      whiteout: "Whiteout",
    };
    const base = labelsByType[type] || "Field";
    if (type === "radio") return "radio_group_1";
    let n = 1;
    while (fields.some((field) => field.name === `${base}${n}`)) n += 1;
    return `${base}${n}`;
  }

  function fieldDefaults(type, pageId, x, y, width, height) {
    const number = nextId++;
    const compact = type === "radio" || type === "checkbox";
    const sizes = {
      label: [160, 26],
      whiteout: [160, 35],
      text: [180, 28],
      textarea: [220, 80],
      radio: [18, 18],
      checkbox: [18, 18],
      dropdown: [180, 30],
      signature: [200, 60],
    };
    const fallback = sizes[type] || [160, 30];
    // Use the dragged box size. Only fall back to defaults on a tiny click.
    const dragged = (width || 0) >= 8 && (height || 0) >= 8;
    let boxWidth = compact ? fallback[0] : dragged ? Math.max(12, width) : fallback[0];
    let boxHeight = compact ? fallback[1] : dragged ? Math.max(10, height) : fallback[1];
    if (type === "signature") {
      // Keeping the drawn ratio stops the signature from looking stretched.
      boxHeight = Math.max(16, Math.round(boxWidth / signatureAspect));
    }
    return {
      id: `field-${number}`,
      pageId,
      type,
      x,
      y,
      width: boxWidth,
      height: boxHeight,
      name: nextFieldLabel(type),
      text: type === "label" ? "Label text" : "",
      value: type === "radio" ? `option_${number}` : "Yes",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
      maxLength: 0,
      fontSize: 12,
      // Invisible fields keep the original document looking untouched.
      showBorder: false,
      filledBackground: false,
      borderColor: "#3d4a45",
      textColor: "#17201d",
      backgroundColor: "#ffffff",
      signatureData: type === "signature" ? signatureDataUrl : "",
    };
  }

  async function renderPages() {
    const token = ++renderToken;
    pagesEl.innerHTML = "";

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      if (token !== renderToken) return;
      const pageData = pages[pageIndex];
      const section = document.createElement("section");
      section.className = "pdf-page-section";
      section.dataset.pageId = pageData.id;
      section.innerHTML = `
        <div class="pdf-page-controls">
          <strong>${pageIndex + 1}</strong>
          <button type="button" data-page-action="delete" title="Delete page">⌫</button>
          <button type="button" data-page-action="zoom-in" title="Zoom in">⌕+</button>
          <button type="button" data-page-action="zoom-out" title="Zoom out">⌕−</button>
          <button type="button" data-page-action="undo" title="Undo">↶</button>
          <button type="button" data-page-action="redo" title="Redo">↷</button>
          <button type="button" data-page-action="insert" title="Insert blank page">⊕ Insert page here</button>
        </div>
        <div class="pdf-page-stage" style="width:${pageData.width * zoom}px;height:${pageData.height * zoom}px">
          <canvas></canvas>
          <div class="pdf-form-layer" data-page-id="${pageData.id}"></div>
        </div>`;
      pagesEl.appendChild(section);

      const canvas = section.querySelector("canvas");
      canvas.width = Math.round(pageData.width * zoom);
      canvas.height = Math.round(pageData.height * zoom);
      canvas.style.width = `${pageData.width * zoom}px`;
      canvas.style.height = `${pageData.height * zoom}px`;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (pageData.sourceIndex !== null && sourcePdf) {
        const sourcePage = await sourcePdf.getPage(pageData.sourceIndex + 1);
        if (token !== renderToken) return;
        await sourcePage.render({ canvasContext: context, viewport: sourcePage.getViewport({ scale: zoom }) }).promise;
      }
    }
    bindPageEvents();
    updateFieldUI();
  }

  function renderFieldOverlays() {
    document.querySelectorAll(".pdf-form-layer").forEach((layer) => {
      const pageId = layer.dataset.pageId;
      layer.innerHTML = "";
      fields
        .filter((field) => field.pageId === pageId)
        .forEach((field) => {
          const element = document.createElement("div");
          element.className = `pdf-placed-field type-${field.type}${selectedId === field.id ? " is-selected" : ""}`;
          element.dataset.fieldId = field.id;
          element.style.left = `${field.x * zoom}px`;
          element.style.top = `${field.y * zoom}px`;
          element.style.width = `${field.width * zoom}px`;
          element.style.height = `${field.height * zoom}px`;
          element.style.setProperty("--field-border", field.showBorder ? field.borderColor : "transparent");
          element.style.setProperty("--field-text", field.textColor);
          element.style.setProperty(
            "--field-bg",
            field.type === "whiteout" ? "#ffffff" : field.filledBackground ? field.backgroundColor : "transparent"
          );
          element.innerHTML = fieldPreview(field);
          ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach((handle) => {
            element.insertAdjacentHTML(
              "beforeend",
              `<i class="pdf-field-resize handle-${handle}" data-handle="${handle}" aria-hidden="true"></i>`
            );
          });
          layer.appendChild(element);
        });
    });
    bindFieldEvents();
  }

  function fieldPreview(field) {
    if (field.type === "label") return `<span style="font-size:${field.fontSize * zoom}px">${escapeHtml(field.text)}</span>`;
    if (field.type === "whiteout") return "";
    if (field.type === "checkbox") return "";
    if (field.type === "radio") return '<span class="pdf-radio-preview"></span>';
    if (field.type === "dropdown") return `<span>${escapeHtml(field.options[0] || "Choose")}</span><b>▾</b>`;
    if (field.type === "signature") {
      return field.signatureData
        ? `<img class="pdf-sign-preview" src="${field.signatureData}" alt="Signature" />`
        : '<span class="pdf-sign-preview">Signature</span>';
    }
    return `<span>${field.type === "textarea" ? "Multiline text" : "Text field"}</span>`;
  }

  function bindPageEvents() {
    document.querySelectorAll(".pdf-page-controls button").forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.closest(".pdf-page-section");
        const pageId = section.dataset.pageId;
        const index = pages.findIndex((page) => page.id === pageId);
        const action = button.dataset.pageAction;
        if (action === "zoom-in") {
          manualZoom = true;
          zoom = Math.min(2.5, +(zoom + 0.15).toFixed(2));
          renderPages();
        } else if (action === "zoom-out") {
          manualZoom = true;
          zoom = Math.max(0.45, +(zoom - 0.15).toFixed(2));
          renderPages();
        } else if (action === "undo") {
          undoBtn.click();
        } else if (action === "redo") {
          redoBtn.click();
        } else if (action === "delete") {
          if (pages.length === 1) return setStatus("A document must contain at least one page.", "error");
          remember();
          pages.splice(index, 1);
          fields = fields.filter((field) => field.pageId !== pageId);
          selectedId = null;
          renderPages();
          updateFieldUI();
        } else if (action === "insert") {
          remember();
          pages.splice(index + 1, 0, {
            id: `page-${nextId++}`,
            sourceIndex: null,
            width: pages[index].width,
            height: pages[index].height,
          });
          renderPages();
        }
      });
    });

    document.querySelectorAll(".pdf-form-layer").forEach((layer) => {
      layer.addEventListener("pointerdown", startDrawing);
    });
  }

  function startDrawing(event) {
    if (!activeTool || event.target !== event.currentTarget) return;
    event.preventDefault();
    const layer = event.currentTarget;
    const rect = layer.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    const ghost = document.createElement("div");
    ghost.className = "pdf-draw-ghost";
    ghost.style.left = `${startX}px`;
    ghost.style.top = `${startY}px`;
    layer.appendChild(ghost);
    layer.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(moveEvent.clientY - rect.top, rect.height));
      ghost.style.left = `${Math.min(startX, x)}px`;
      ghost.style.top = `${Math.min(startY, y)}px`;
      ghost.style.width = `${Math.abs(x - startX)}px`;
      ghost.style.height = `${Math.abs(y - startY)}px`;
    };
    const finish = (upEvent) => {
      layer.removeEventListener("pointermove", move);
      layer.removeEventListener("pointerup", finish);
      ghost.remove();
      const x2 = Math.max(0, Math.min(upEvent.clientX - rect.left, rect.width));
      const y2 = Math.max(0, Math.min(upEvent.clientY - rect.top, rect.height));
      remember();
      const field = fieldDefaults(
        activeTool,
        layer.dataset.pageId,
        Math.min(startX, x2) / zoom,
        Math.min(startY, y2) / zoom,
        Math.abs(x2 - startX) / zoom,
        Math.abs(y2 - startY) / zoom
      );
      fields.push(field);
      selectedId = field.id;
      updateFieldUI();
      setStatus(`${labels[field.type]} added.`, "ok");
    };
    layer.addEventListener("pointermove", move);
    layer.addEventListener("pointerup", finish);
  }

  function bindFieldEvents() {
    document.querySelectorAll(".pdf-placed-field").forEach((element) => {
      element.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        const field = fields.find((item) => item.id === element.dataset.fieldId);
        if (!field) return;
        selectField(field.id);
        if (floatMore) floatMore.hidden = true;

        const handle = event.target.dataset?.handle || "";
        const startX = event.clientX;
        const startY = event.clientY;
        const original = { x: field.x, y: field.y, width: field.width, height: field.height };
        const minSize = 10;
        let moved = false;
        element.setPointerCapture(event.pointerId);

        const move = (moveEvent) => {
          const dx = (moveEvent.clientX - startX) / zoom;
          const dy = (moveEvent.clientY - startY) / zoom;
          if (!moved && (handle || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)) {
            moved = true;
            remember();
          }

          if (!handle) {
            field.x = Math.max(0, original.x + dx);
            field.y = Math.max(0, original.y + dy);
          } else {
            if (handle.includes("e")) field.width = Math.max(minSize, original.width + dx);
            if (handle.includes("s")) field.height = Math.max(minSize, original.height + dy);
            if (handle.includes("w")) {
              const width = Math.max(minSize, original.width - dx);
              field.x = original.x + (original.width - width);
              field.width = width;
            }
            if (handle.includes("n")) {
              const height = Math.max(minSize, original.height - dy);
              field.y = original.y + (original.height - height);
              field.height = height;
            }
          }

          element.style.left = `${field.x * zoom}px`;
          element.style.top = `${field.y * zoom}px`;
          element.style.width = `${field.width * zoom}px`;
          element.style.height = `${field.height * zoom}px`;
          positionFloatingToolbar();
        };
        const finish = () => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerup", finish);
          if (moved) renderFloatingToolbar();
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerup", finish);
      });
    });
  }

  function positionFloatingToolbar() {
    if (!floatBar || floatBar.hidden) return;
    const element = document.querySelector(`.pdf-placed-field[data-field-id="${selectedId}"]`);
    if (!element) {
      floatBar.hidden = true;
      return;
    }
    const rect = element.getBoundingClientRect();
    floatBar.style.left = `${rect.left + rect.width / 2}px`;
    floatBar.style.top = `${Math.max(72, rect.top)}px`;
  }

  function duplicateField(field) {
    remember();
    const copy = JSON.parse(JSON.stringify(field));
    copy.id = `field-${nextId++}`;
    copy.name = nextFieldLabel(field.type);
    copy.x += 18;
    copy.y += 18;
    fields.push(copy);
    selectedId = copy.id;
    updateFieldUI();
    setStatus("Field duplicated.", "ok");
  }

  function deleteSelectedField() {
    if (!selectedId) return;
    remember();
    fields = fields.filter((field) => field.id !== selectedId);
    selectedId = null;
    updateFieldUI();
  }

  function applyFieldProp(field, prop, value, { rememberChange = true, refresh = "full" } = {}) {
    if (rememberChange) remember();
    if (prop === "options") field.options = String(value).split("\n").map((item) => item.trim()).filter(Boolean);
    else if (prop === "width" || prop === "height") field[prop] = Math.max(10, Number(value));
    else if (prop === "fontSize") field.fontSize = Math.max(6, Math.min(72, Number(value)));
    else if (prop === "required" || prop === "showBorder" || prop === "filledBackground") field[prop] = Boolean(value);
    else field[prop] = value;
    if (refresh === "preview") patchFieldPreview(field);
    else updateFieldUI();
  }

  function renderFloatingToolbar() {
    if (!floatBar || !floatBarInner || !floatMore) return;
    const field = fields.find((item) => item.id === selectedId);
    if (!field) {
      floatBar.hidden = true;
      floatMore.hidden = true;
      return;
    }

    floatBar.hidden = false;
    const isForm = fieldTypes.has(field.type);
    const canStyleText = !["whiteout", "signature"].includes(field.type);
    const labelEdit =
      field.type === "label"
        ? `<input class="pdf-float-text" data-prop="text" type="text" value="${escapeHtml(field.text)}" placeholder="Label text" />`
        : "";
    const nameField = isForm
      ? `<input class="pdf-float-name" data-prop="name" type="text" value="${escapeHtml(field.name)}" placeholder="Field name" title="Field name" />`
      : "";

    floatBarInner.innerHTML = `
      ${labelEdit}
      ${nameField}
      ${
        canStyleText
          ? `<span class="pdf-float-group">
              <button type="button" data-action="font-down" title="Smaller text">A−</button>
              <span class="pdf-float-size">${field.fontSize}</span>
              <button type="button" data-action="font-up" title="Larger text">A+</button>
            </span>
            <label class="pdf-float-color" title="Text color">
              <input data-prop="textColor" type="color" value="${field.textColor}" />
            </label>`
          : ""
      }
      ${field.type === "signature" ? `<button type="button" data-action="change-sign">Change</button>` : ""}
      <button type="button" data-action="more" title="More settings">⋯</button>
      <button type="button" data-action="duplicate" title="Duplicate">⧉</button>
      <button type="button" data-action="delete" title="Delete">⌫</button>`;

    const options = field.type === "dropdown"
      ? `<label>Options (one per line)<textarea data-prop="options" rows="4">${escapeHtml(field.options.join("\n"))}</textarea></label>`
      : "";
    const radioValue = field.type === "radio"
      ? `<label>Field value<input data-prop="value" type="text" value="${escapeHtml(field.value)}"></label>`
      : "";
    const maxLength = field.type === "text" || field.type === "textarea"
      ? `<label>Max length<input data-prop="maxLength" type="number" min="0" value="${field.maxLength || 0}"></label>`
      : "";

    floatMore.innerHTML = `
      <div class="pdf-float-more-grid">
        <label>Width<input data-prop="width" type="number" min="10" value="${Math.round(field.width)}"></label>
        <label>Height<input data-prop="height" type="number" min="10" value="${Math.round(field.height)}"></label>
        ${radioValue}${options}${maxLength}
        ${isForm ? `<label class="pdf-check-label"><input data-prop="required" type="checkbox"${field.required ? " checked" : ""}> Mandatory</label>` : ""}
        ${isForm ? `<label class="pdf-check-label"><input data-prop="showBorder" type="checkbox"${field.showBorder ? " checked" : ""}> Show border</label>` : ""}
        ${isForm && field.showBorder ? `<label>Border color<input data-prop="borderColor" type="color" value="${field.borderColor}"></label>` : ""}
        ${isForm ? `<label class="pdf-check-label"><input data-prop="filledBackground" type="checkbox"${field.filledBackground ? " checked" : ""}> Fill background</label>` : ""}
        ${isForm && field.filledBackground ? `<label>Background color<input data-prop="backgroundColor" type="color" value="${field.backgroundColor}"></label>` : ""}
      </div>`;
    floatMore.hidden = true;

    floatBarInner.querySelector('[data-action="font-down"]')?.addEventListener("click", () => {
      applyFieldProp(field, "fontSize", field.fontSize - 1);
    });
    floatBarInner.querySelector('[data-action="font-up"]')?.addEventListener("click", () => {
      applyFieldProp(field, "fontSize", field.fontSize + 1);
    });
    floatBarInner.querySelector('[data-action="duplicate"]')?.addEventListener("click", () => duplicateField(field));
    floatBarInner.querySelector('[data-action="delete"]')?.addEventListener("click", deleteSelectedField);
    floatBarInner.querySelector('[data-action="change-sign"]')?.addEventListener("click", () => openSignatureCreator(field.id));
    floatBarInner.querySelector('[data-action="more"]')?.addEventListener("click", () => {
      floatMore.hidden = !floatMore.hidden;
      positionFloatingToolbar();
    });

    floatBarInner.querySelectorAll("[data-prop]").forEach((control) => {
      if (control.type === "text") {
        control.addEventListener("input", () => {
          field[control.dataset.prop] = control.value;
          patchFieldPreview(field);
        });
        control.addEventListener("change", () => remember());
        return;
      }
      control.addEventListener("change", () => {
        applyFieldProp(field, control.dataset.prop, control.type === "checkbox" ? control.checked : control.value);
      });
    });
    floatMore.querySelectorAll("[data-prop]").forEach((control) => {
      control.addEventListener("change", () => {
        applyFieldProp(field, control.dataset.prop, control.type === "checkbox" ? control.checked : control.value);
      });
    });

    requestAnimationFrame(positionFloatingToolbar);
  }

  function renderOrderList() {
    const ordered = fields.filter((field) => fieldTypes.has(field.type));
    orderList.innerHTML = ordered
      .map(
        (field, index) => `<li data-id="${field.id}">
          <span><b>${index + 1}</b> ${escapeHtml(field.name)} <small>Page ${pages.findIndex((page) => page.id === field.pageId) + 1}</small></span>
          <span><button type="button" data-dir="-1" aria-label="Move up">↑</button><button type="button" data-dir="1" aria-label="Move down">↓</button></span>
        </li>`
      )
      .join("");
    orderList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.closest("li").dataset.id;
        const current = fields.findIndex((field) => field.id === id);
        const direction = Number(button.dataset.dir);
        let target = current + direction;
        while (target >= 0 && target < fields.length && !fieldTypes.has(fields[target].type)) target += direction;
        if (target < 0 || target >= fields.length) return;
        remember();
        [fields[current], fields[target]] = [fields[target], fields[current]];
        renderOrderList();
      });
    });
  }

  function hexColor(hex) {
    const value = (hex || "#000000").replace("#", "");
    return PDFLib.rgb(
      parseInt(value.slice(0, 2), 16) / 255,
      parseInt(value.slice(2, 4), 16) / 255,
      parseInt(value.slice(4, 6), 16) / 255
    );
  }

  function filenameWithoutPdf(name) {
    return String(name || "document.pdf").replace(/\.pdf$/i, "");
  }

  function cleanDownloadName(name) {
    const clean = String(name || "")
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/[. ]+$/g, "");
    return `${clean || "document"}.pdf`;
  }

  function requestPdfDownload(publish = false) {
    pendingPublish = publish;
    renameError.textContent = "";
    downloadNameInput.value = filenameWithoutPdf(sourceFileName);
    renameDialog.showModal();
    requestAnimationFrame(() => {
      downloadNameInput.focus();
      downloadNameInput.select();
    });
  }

  async function exportPdf(publish = false, downloadName = sourceFileName) {
    try {
      setStatus("Creating your fillable PDF...");
      const out = await PDFLib.PDFDocument.create();
      const original = sourceBytes ? await PDFLib.PDFDocument.load(sourceBytes.slice()) : null;
      const outputPages = new Map();
      const font = await out.embedFont(PDFLib.StandardFonts.Helvetica);

      for (const pageData of pages) {
        let page;
        if (original && pageData.sourceIndex !== null) {
          [page] = await out.copyPages(original, [pageData.sourceIndex]);
          out.addPage(page);
        } else {
          page = out.addPage([pageData.width, pageData.height]);
        }
        outputPages.set(pageData.id, page);
      }

      const form = out.getForm();
      const created = new Map();
      for (const field of fields) {
        const page = outputPages.get(field.pageId);
        if (!page) continue;
        const y = page.getHeight() - field.y - field.height;
        if (field.type === "whiteout") {
          page.drawRectangle({ x: field.x, y, width: field.width, height: field.height, color: PDFLib.rgb(1, 1, 1) });
          continue;
        }
        if (field.type === "label") {
          page.drawText(field.text || "Label", {
            x: field.x,
            y: y + Math.max(0, field.height - field.fontSize),
            size: field.fontSize,
            font,
            color: hexColor(field.textColor),
            maxWidth: field.width,
          });
          continue;
        }
        if (field.type === "signature") {
          if (!field.signatureData) continue;
          const signatureImage = await out.embedPng(field.signatureData);
          const fit = Math.min(field.width / signatureImage.width, field.height / signatureImage.height);
          const drawWidth = signatureImage.width * fit;
          const drawHeight = signatureImage.height * fit;
          page.drawImage(signatureImage, {
            x: field.x + (field.width - drawWidth) / 2,
            y: y + (field.height - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight,
          });
          continue;
        }

        // Passing undefined (instead of omitting the key) keeps pdf-lib from applying its white/black defaults.
        const options = {
          x: field.x,
          y,
          width: field.width,
          height: field.height,
          borderWidth: field.showBorder ? 1 : 0,
          borderColor: field.showBorder ? hexColor(field.borderColor) : undefined,
          backgroundColor: field.filledBackground ? hexColor(field.backgroundColor) : undefined,
          textColor: hexColor(field.textColor),
          font,
        };
        const safeName = (field.name || "").trim() || `Field${field.id}`;
        let pdfField;

        if (field.type === "radio") {
          pdfField = created.get(`radio:${safeName}`);
          if (!pdfField) {
            pdfField = form.createRadioGroup(safeName);
            created.set(`radio:${safeName}`, pdfField);
          }
          pdfField.addOptionToPage(field.value || field.id, page, options);
        } else if (field.type === "checkbox") {
          // Keep the user's field name exactly as entered.
          if (created.has(`field:${safeName}`)) {
            throw new Error(`Two fields use the name "${safeName}". Rename one of them before applying changes.`);
          }
          pdfField = form.createCheckBox(safeName);
          created.set(`field:${safeName}`, pdfField);
          pdfField.addToPage(page, options);
          pdfField.uncheck();
        } else if (field.type === "dropdown") {
          if (created.has(`field:${safeName}`)) {
            throw new Error(`Two fields use the name "${safeName}". Rename one of them before applying changes.`);
          }
          pdfField = form.createDropdown(safeName);
          created.set(`field:${safeName}`, pdfField);
          pdfField.addOptions(field.options.length ? field.options : ["Option 1"]);
          pdfField.addToPage(page, options);
          pdfField.setFontSize(field.fontSize);
        } else {
          if (created.has(`field:${safeName}`)) {
            throw new Error(`Two fields use the name "${safeName}". Rename one of them before applying changes.`);
          }
          pdfField = form.createTextField(safeName);
          created.set(`field:${safeName}`, pdfField);
          if (field.type === "textarea") pdfField.enableMultiline();
          if (field.maxLength > 0) pdfField.setMaxLength(field.maxLength);
          // The font size can only be set once the widget exists, otherwise the field has no appearance entry.
          pdfField.addToPage(page, options);
          pdfField.setFontSize(field.fontSize);
        }
        if (field.required && pdfField?.enableRequired) pdfField.enableRequired();
      }

      // Tells readers such as Chrome and Acrobat to build appearances so the form stays fillable for anyone.
      if (PDFLib.PDFName && PDFLib.PDFBool) {
        form.acroForm.dict.set(PDFLib.PDFName.of("NeedAppearances"), PDFLib.PDFBool.True);
      }
      try {
        form.updateFieldAppearances(font);
      } catch (appearanceError) {
        // Some readers regenerate appearances themselves; keep the form usable instead of failing the export.
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = cleanDownloadName(filenameWithoutPdf(downloadName));
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus(publish ? "Form published as a downloadable fillable PDF." : "Fillable PDF downloaded.", "ok");
    } catch (error) {
      setStatus(error?.message || "Could not create the fillable PDF.", "error");
    }
  }

  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") input.click();
  });
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("is-drag");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("is-drag"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("is-drag");
    loadPdf(event.dataTransfer.files[0]);
  });
  input.addEventListener("change", () => loadPdf(input.files[0]));
  window.addEventListener("resize", () => {
    if (editor.hidden || manualZoom || !pages.length) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const previous = zoom;
      fitZoomToWidth();
      if (zoom !== previous) renderPages();
    }, 200);
  });
  blankBtn.addEventListener("click", createBlank);
  toolbar.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.tool === "signature") openSignatureCreator();
      else selectTool(button.dataset.tool);
    });
  });
  document.querySelectorAll("[data-sign-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-sign-tab]").forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });
      document.querySelectorAll("[data-sign-pane]").forEach((pane) => {
        pane.hidden = pane.dataset.signPane !== tab.dataset.signTab;
      });
      signatureChoice = null;
      useSignatureBtn.disabled = true;
      signatureError.textContent = "";
    });
  });
  signatureName.addEventListener("input", () => {
    signatureChoice = null;
    useSignatureBtn.disabled = true;
    clearTimeout(signatureRenderTimer);
    signatureRenderTimer = setTimeout(() => {
      renderSignatureChoices().catch(() => {});
    }, 220);
  });
  signatureImageInput.addEventListener("change", async () => {
    const file = signatureImageInput.files[0];
    if (!file) return;
    try {
      signatureError.textContent = "";
      const signature = await prepareUploadedSignature(file);
      signatureChoice = { kind: "image", ...signature };
      uploadedSignature.querySelector("img").src = signature.dataUrl;
      uploadedSignature.hidden = false;
      useSignatureBtn.disabled = false;
    } catch (error) {
      signatureError.textContent = error?.message || "Could not read this image.";
    }
  });
  document.getElementById("pdfRemoveSignatureImage").addEventListener("click", () => {
    signatureImageInput.value = "";
    signatureChoice = null;
    uploadedSignature.hidden = true;
    uploadedSignature.querySelector("img").removeAttribute("src");
    useSignatureBtn.disabled = true;
  });
  const closeSignatureDialog = () => signatureDialog.close();
  document.getElementById("pdfSignatureClose").addEventListener("click", closeSignatureDialog);
  document.getElementById("pdfSignatureCancel").addEventListener("click", closeSignatureDialog);
  signatureDialog.addEventListener("click", (event) => {
    if (event.target === signatureDialog) closeSignatureDialog();
  });
  useSignatureBtn.addEventListener("click", async () => {
    try {
      useSignatureBtn.disabled = true;
      signatureError.textContent = "";
      const signature =
        signatureChoice?.kind === "image"
          ? signatureChoice
          : await buildTypedSignature(
              signatureName.value.trim(),
              signatureFonts[signatureChoice?.index ?? 0]
            );

      const aspect = signature.height ? signature.width / signature.height : 3.2;
      if (signatureEditFieldId) {
        const field = fields.find((item) => item.id === signatureEditFieldId);
        if (field) {
          remember();
          field.signatureData = signature.dataUrl;
          field.height = Math.max(18, Math.round(field.width / aspect));
          updateFieldUI();
        }
      } else {
        signatureDataUrl = signature.dataUrl;
        signatureAspect = aspect;
        activeTool = null;
        selectTool("signature");
      }
      signatureDialog.close();
    } catch (error) {
      signatureError.textContent = error?.message || "Could not create this signature.";
      useSignatureBtn.disabled = false;
    }
  });
  document.getElementById("pdfReorderBtn").addEventListener("click", () => {
    renderOrderList();
    orderDialog.showModal();
  });
  document.getElementById("pdfOrderClose")?.addEventListener("click", () => orderDialog.close());
  orderDialog?.addEventListener("click", (event) => {
    if (event.target === orderDialog) orderDialog.close();
  });
  orderDialog?.addEventListener("close", () => {
    orderList.innerHTML = "";
  });
  document.addEventListener("pointerdown", (event) => {
    if (!editor.hidden && !event.target.closest(".pdf-placed-field, .pdf-field-float-bar, .pdf-order-dialog")) {
      if (event.target.closest(".pdf-form-layer")) {
        selectedId = null;
        floatBar.hidden = true;
        if (floatMore) floatMore.hidden = true;
        document.querySelectorAll(".pdf-placed-field.is-selected").forEach((node) => node.classList.remove("is-selected"));
      }
    }
  });
  undoBtn.addEventListener("click", () => {
    if (!history.length) return;
    future.push(snapshot());
    restore(history.pop());
  });
  redoBtn.addEventListener("click", () => {
    if (!future.length) return;
    history.push(snapshot());
    restore(future.pop());
  });
  document.getElementById("pdfApplyBtn").addEventListener("click", () => requestPdfDownload(false));
  document.getElementById("pdfPublishBtn").addEventListener("click", () => requestPdfDownload(true));
  document.getElementById("pdfRenameCancel").addEventListener("click", () => renameDialog.close());
  renameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const baseName = filenameWithoutPdf(downloadNameInput.value).trim();
    if (!baseName) {
      renameError.textContent = "Please enter a file name.";
      downloadNameInput.focus();
      return;
    }
    const downloadName = cleanDownloadName(baseName);
    renameDialog.close();
    exportPdf(pendingPublish, downloadName);
  });
  renameDialog.addEventListener("click", (event) => {
    if (event.target === renameDialog) renameDialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") selectTool(null);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      (event.shiftKey ? redoBtn : undoBtn).click();
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selectedId && !/INPUT|TEXTAREA/.test(event.target.tagName)) {
      remember();
      fields = fields.filter((field) => field.id !== selectedId);
      selectedId = null;
      updateFieldUI();
    }
  });
  pagesScroll?.addEventListener("scroll", positionFloatingToolbar, { passive: true });
  window.addEventListener("resize", positionFloatingToolbar);
})();
