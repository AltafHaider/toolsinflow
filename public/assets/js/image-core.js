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

  function drawToCanvas(img, maxW = 0, maxH = 0) {
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (maxW > 0 || maxH > 0) {
      const rw = maxW > 0 ? maxW / w : 1;
      const rh = maxH > 0 ? maxH / h : 1;
      const r = Math.min(rw || 1, rh || 1, 1);
      // if only one dim set and we want upscale allowed for resize tool, handled by caller
      w = Math.max(1, Math.round(w * (maxW || maxH ? Math.min(maxW ? maxW / (img.naturalWidth || img.width) : 999, maxH ? maxH / (img.naturalHeight || img.height) : 999) : 1)));
      h = Math.max(1, Math.round((img.naturalHeight || img.height) * (w / (img.naturalWidth || img.width))));
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  }

  function resizeCanvas(img, width, height, keepRatio) {
    let w = width || img.naturalWidth;
    let h = height || img.naturalHeight;
    if (keepRatio) {
      if (width && !height) {
        w = width;
        h = Math.round((img.naturalHeight / img.naturalWidth) * width);
      } else if (height && !width) {
        h = height;
        w = Math.round((img.naturalWidth / img.naturalHeight) * height);
      } else if (width && height) {
        const r = Math.min(width / img.naturalWidth, height / img.naturalHeight);
        w = Math.round(img.naturalWidth * r);
        h = Math.round(img.naturalHeight * r);
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext("2d");
    // white bg for jpeg destinations
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
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

  return { loadImage, drawToCanvas, resizeCanvas, exportCanvas, downloadBlob, baseName };
})();
