const LIBRARY_VERSION = "1.5.8";
const MODEL_DATA_PATH = `https://staticimgly.com/@imgly/background-removal-data/${LIBRARY_VERSION}/dist/`;
const LIBRARY_SOURCES = [
  `https://cdn.jsdelivr.net/npm/@imgly/background-removal@${LIBRARY_VERSION}/+esm`,
  `https://unpkg.com/@imgly/background-removal@${LIBRARY_VERSION}/dist/index.mjs`,
];

let removerPromise = null;

function canUseCanvas() {
  return typeof OffscreenCanvas !== "undefined" && typeof createImageBitmap === "function";
}

async function loadRemover() {
  if (removerPromise) return removerPromise;
  removerPromise = (async () => {
    let lastError = null;
    for (const source of LIBRARY_SOURCES) {
      try {
        const module = await import(source);
        const remove = module.removeBackground || module.default;
        if (typeof remove === "function") return remove;
      } catch (error) {
        lastError = error;
      }
    }
    const failure = new Error(lastError?.message || "Could not load the background remover.");
    // Some browsers block module loading inside workers, so the page finishes the job instead.
    failure.fallbackToMainThread = true;
    throw failure;
  })();
  return removerPromise;
}

async function shrinkForModel(blob, maxSide) {
  if (!canUseCanvas() || !maxSide) return blob;
  const bitmap = await createImageBitmap(blob);
  const largest = Math.max(bitmap.width, bitmap.height);
  if (largest <= maxSide) {
    bitmap.close?.();
    return blob;
  }
  const scale = maxSide / largest;
  const canvas = new OffscreenCanvas(
    Math.max(1, Math.round(bitmap.width * scale)),
    Math.max(1, Math.round(bitmap.height * scale))
  );
  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.95 });
}

async function refineEdges(blob) {
  if (!canUseCanvas()) return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i];
    if (alpha === 0 || alpha === 255) continue;
    // A gentle alpha stretch clears the faint halo around the subject. Judging pixels by
    // brightness instead would delete white shirts, light hair and pale objects.
    data[i] = alpha <= 10 ? 0 : alpha >= 245 ? 255 : Math.round(((alpha - 10) * 255) / 235);
  }
  context.putImageData(image, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

async function paintBackground(blob, color) {
  if (!canUseCanvas()) return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  context.fillStyle = color || "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return canvas.convertToBlob({ type: "image/png" });
}

async function cutOut(blob, id, maxSide) {
  const removeBackground = await loadRemover();
  const source = await shrinkForModel(blob, maxSide);

  const attempts = [];
  if (self.navigator?.gpu) attempts.push({ device: "gpu", model: "isnet_fp16" });
  attempts.push({ device: "cpu", model: "isnet_fp16" });
  attempts.push({ device: "cpu", model: "isnet_quint8" });

  let lastError = null;
  for (const attempt of attempts) {
    try {
      return await removeBackground(source, {
        publicPath: MODEL_DATA_PATH,
        device: attempt.device,
        model: attempt.model,
        output: { format: "image/png", type: "foreground" },
        progress: (key, current, total) => {
          self.postMessage({ type: "progress", id, key, current, total });
        },
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not remove this background.");
}

self.addEventListener("message", async (event) => {
  const { id, type, buffer, mime, maxSide, color } = event.data || {};
  try {
    const input = new Blob([buffer], { type: mime || "image/png" });
    const output =
      type === "compose"
        ? await paintBackground(input, color)
        : await refineEdges(await cutOut(input, id, maxSide));

    const resultBuffer = await output.arrayBuffer();
    self.postMessage({ type: "result", id, buffer: resultBuffer, mime: output.type || "image/png" }, [
      resultBuffer,
    ]);
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      error: error?.message || "Could not remove this background.",
      fallback: Boolean(error?.fallbackToMainThread),
    });
  }
});

self.postMessage({ type: "ready" });
