/* Shared image helpers (Canvas API) */
window.CZImage = (() => {
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image."));
      };
      img.src = url;
    });
  }

  async function loadBitmap(file) {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch (_) {
        try {
          return await createImageBitmap(file);
        } catch (_) {
          /* fall through */
        }
      }
    }
    return loadImage(file);
  }

  function sourceSize(source) {
    return {
      width: source.naturalWidth || source.width || 1,
      height: source.naturalHeight || source.height || 1,
    };
  }

  function drawSource(ctx, source, dx, dy, dw, dh) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, dx, dy, dw, dh);
  }

  function imageToCanvas(source, width = 0, height = 0, fill = null) {
    const size = sourceSize(source);
    const w = Math.max(1, Math.round(width || size.width));
    const h = Math.max(1, Math.round(height || size.height));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, w, h);
    }
    drawSource(ctx, source, 0, 0, w, h);
    return canvas;
  }

  function drawToCanvas(img, maxW = 0, maxH = 0) {
    const size = sourceSize(img);
    let w = size.width;
    let h = size.height;
    if (maxW > 0 || maxH > 0) {
      const rw = maxW > 0 ? maxW / w : 1;
      const rh = maxH > 0 ? maxH / h : 1;
      const r = Math.min(rw || 1, rh || 1, 1);
      w = Math.max(1, Math.round(w * r));
      h = Math.max(1, Math.round(h * r));
    }
    return imageToCanvas(img, w, h, null);
  }

  function resizeCanvas(img, width, height, keepRatio) {
    const size = sourceSize(img);
    let w = width || size.width;
    let h = height || size.height;
    if (keepRatio) {
      if (width && !height) {
        w = width;
        h = Math.round((size.height / size.width) * width);
      } else if (height && !width) {
        h = height;
        w = Math.round((size.width / size.height) * height);
      } else if (width && height) {
        const r = Math.min(width / size.width, height / size.height);
        w = Math.round(size.width * r);
        h = Math.round(size.height * r);
      }
    }
    return imageToCanvas(img, w, h, "#ffffff");
  }

  function exportCanvas(canvas, type, quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Export failed."));
          else resolve(blob);
        },
        type,
        quality
      );
    });
  }

  async function encodeJpeg(sourceCanvas, quality, scale = 1) {
    const w = Math.max(1, Math.round(sourceCanvas.width * scale));
    const h = Math.max(1, Math.round(sourceCanvas.height * scale));
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    return exportCanvas(out, "image/jpeg", quality);
  }

  async function compressToTarget(sourceCanvas, targetBytes, options = {}) {
    const minQ = options.minQuality ?? 0.12;
    const maxQ = options.maxQuality ?? 0.92;
    const minScale = options.minScale ?? 0.35;
    let best = null;
    let bestMeta = { quality: maxQ, scale: 1 };

    async function tryEncode(quality, scale) {
      const blob = await encodeJpeg(sourceCanvas, quality, scale);
      const meta = { quality, scale, size: blob.size };
      if (blob.size <= targetBytes) {
        if (!best || blob.size > best.size) {
          best = blob;
          bestMeta = meta;
        }
        return { blob, meta, under: true };
      }
      if (!best || blob.size < best.size) {
        best = blob;
        bestMeta = meta;
      }
      return { blob, meta, under: false };
    }

    // Phase 1: quality search at full size
    let lo = minQ;
    let hi = maxQ;
    for (let i = 0; i < 10; i += 1) {
      const mid = (lo + hi) / 2;
      const result = await tryEncode(mid, 1);
      if (result.under) lo = mid;
      else hi = mid;
    }

    // Phase 2: if still too large, shrink dimensions while keeping best quality under target
    if (!best || best.size > targetBytes) {
      let sLo = minScale;
      let sHi = 1;
      for (let i = 0; i < 10; i += 1) {
        const scale = (sLo + sHi) / 2;
        const result = await tryEncode(Math.max(minQ, lo), scale);
        if (result.under) sLo = scale;
        else sHi = scale;
      }
    }

    if (!best) throw new Error("Could not compress this image.");
    return { blob: best, ...bestMeta };
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function baseName(file) {
    return String(file.name || "image").replace(/\.[^.]+$/, "");
  }

  return {
    loadImage,
    loadBitmap,
    drawToCanvas,
    resizeCanvas,
    imageToCanvas,
    exportCanvas,
    encodeJpeg,
    compressToTarget,
    formatBytes,
    downloadBlob,
    baseName,
  };
})();
