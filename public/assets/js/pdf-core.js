/* Shared PDF helpers (pdf-lib + pdf.js via CDN globals) */
window.CZPdf = (() => {
  function setPdfJsWorker() {
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  async function readFileBytes(file) {
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf);
  }

  function downloadBytes(bytes, filename, mime = "application/pdf") {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function formatBytes(n) {
    if (!n) return "0 B";
    const u = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < u.length - 1) {
      v /= 1024;
      i += 1;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
  }

  async function renderPageToCanvas(pdfDoc, pageNum, scale = 1.25) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return { canvas, viewport, page };
  }

  async function canvasToJpegBytes(canvas, quality = 0.72) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Could not encode page image.");
    return new Uint8Array(await blob.arrayBuffer());
  }

  return {
    setPdfJsWorker,
    readFileBytes,
    downloadBytes,
    formatBytes,
    renderPageToCanvas,
    canvasToJpegBytes,
  };
})();
