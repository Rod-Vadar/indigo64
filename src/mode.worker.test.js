jest.mock('mode-stack-processing', () => ({ modeFiles: jest.fn() }));
import { modeFiles } from 'mode-stack-processing';
import './mode.worker';

describe('GPU preflight', () => {
  let postMessage;
  beforeEach(() => {
    postMessage = jest.spyOn(self, 'postMessage').mockImplementation(() => {});
    modeFiles.mockReset();
  });
  afterEach(() => { postMessage.mockRestore(); delete navigator.gpu; });

  it('reports an unavailable adapter before reading any images', async () => {
    Object.defineProperty(navigator, 'gpu', { configurable: true, value: { requestAdapter: jest.fn().mockResolvedValue(null) } });
    await self.onmessage({ data: { type: 'start', processor: 'webgpu', files: [{}], memory: 64 } });
    expect(modeFiles).not.toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', message: 'No WebGPU adapter is available' }));
  });

  it('continues to processing when a WebGPU device is available', async () => {
    const destroy = jest.fn();
    Object.defineProperty(navigator, 'gpu', { configurable: true, value: { requestAdapter: jest.fn().mockResolvedValue({ requestDevice: jest.fn().mockResolvedValue({ destroy }) }) } });
    modeFiles.mockResolvedValue({ width: 1, height: 1, data: new Uint8ClampedArray([1, 2, 3, 255]) });
    await self.onmessage({ data: { type: 'start', processor: 'webgpu', files: [{}], memory: 64 } });
    expect(destroy).toHaveBeenCalled();
    expect(modeFiles).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ processor: 'webgpu' }));
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'done' }), expect.any(Array));
  });

  it('reports a stalled adapter request without preparing the images', async () => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, 'gpu', { configurable: true, value: { requestAdapter: jest.fn(() => new Promise(() => {})) } });
    const running = self.onmessage({ data: { type: 'start', processor: 'webgpu', files: [{}], memory: 64 } });
    jest.advanceTimersByTime(15000);
    await running;
    expect(modeFiles).not.toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', message: 'WebGPU adapter check timed out after 15 seconds' }));
    jest.useRealTimers();
  });
});
