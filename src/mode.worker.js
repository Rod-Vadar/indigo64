/* eslint-disable no-restricted-globals */
import { modeFiles } from 'mode-stack-processing';

function waitForGpu(promise, stage, signal, disposeLateValue = () => {}) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (callback, value) => {
      if (finished) return false;
      finished = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      callback(value);
      return true;
    };
    const onAbort = () => finish(reject, new DOMException('Processing cancelled', 'AbortError'));
    const timer = setTimeout(() => finish(reject, new Error(`WebGPU ${stage} timed out after 15 seconds`)), 15000);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
    Promise.resolve(promise).then(value => {
      if (!finish(resolve, value)) disposeLateValue(value);
    }, error => finish(reject, error));
  });
}

let controller;
self.onmessage = async ({ data }) => {
  if (data.type === 'cancel') { controller?.abort(); return; }
  if (data.type !== 'start' || controller) return;
  controller = new AbortController();
  let prepared = 0;
  try {
    if (data.processor === 'webgpu') {
      if (!navigator.gpu) throw new Error('WebGPU is not available in this browser');
      self.postMessage({ type: 'progress', progress: { phase: 'gpu-adapter', completed: 0, total: 1 } });
      const adapter = await waitForGpu(navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }), 'adapter check', controller.signal);
      if (controller.signal.aborted) throw new DOMException('Processing cancelled', 'AbortError');
      if (!adapter) throw new Error('No WebGPU adapter is available');
      self.postMessage({ type: 'progress', progress: { phase: 'gpu-device', completed: 0, total: 1 } });
      const device = await waitForGpu(adapter.requestDevice(), 'device creation', controller.signal, lateDevice => lateDevice?.destroy());
      device.destroy();
      if (controller.signal.aborted) throw new DOMException('Processing cancelled', 'AbortError');
    }
    const result = await modeFiles(data.files, {
      processor: data.processor,
      maxWorkingMemoryBytes: data.memory * 1024 * 1024,
      signal: controller.signal,
      onProgress: progress => { if (progress.phase === 'prepare') prepared = progress.completed; self.postMessage({ type: 'progress', progress }); },
    });
    self.postMessage({ type: 'done', width: result.width, height: result.height, buffer: result.data.buffer }, [result.data.buffer]);
  } catch (error) {
    let message = error.message;
    if (message === 'All image dimensions must match' && data.files[prepared]) {
      try {
        const first = await createImageBitmap(data.files[0]);
        const different = await createImageBitmap(data.files[prepared]);
        message = `“${data.files[prepared].name}” is ${different.width} × ${different.height} pixels, but the first image is ${first.width} × ${first.height}. All images must have the same dimensions`;
        first.close(); different.close();
      } catch { /* Keep the library's original error if decoding fails. */ }
    }
    self.postMessage({ type: 'error', name: error.name, message });
  } finally { controller = null; }
};
