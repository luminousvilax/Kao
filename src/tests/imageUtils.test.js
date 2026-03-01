import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage } from '../lib/imageUtils';

describe('compressImage', () => {
  let fileReaderMock;
  let imageMock;
  let canvasMock;
  let contextMock;

  beforeEach(() => {
    // Mock FileReader
    fileReaderMock = {
      readAsDataURL: vi.fn(),
      result: null,
      onload: null,
      onerror: null,
    };
    window.FileReader = vi.fn();
    window.FileReader.mockImplementation(function () {
      return fileReaderMock;
    });

    // Mock Image
    imageMock = {
      src: '',
      width: 0,
      height: 0,
      onload: null,
      onerror: null,
    };
    window.Image = vi.fn();
    window.Image.mockImplementation(function () {
      return imageMock;
    });

    // Mock Canvas
    contextMock = {
      drawImage: vi.fn(),
    };
    canvasMock = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => contextMock),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,compressed-result'),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') return canvasMock;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves immediately with original file content if file size is small (< 2MB)', async () => {
    const smallFile = new File(['small'], 'small.png', { type: 'image/png' });
    Object.defineProperty(smallFile, 'size', { value: 1024 * 1024 }); // 1MB

    // Setup FileReader behavior for small file path
    fileReaderMock.readAsDataURL.mockImplementation(function () {
      // Simulate successful read
      this.result = 'data:image/png;base64,small-content';
      if (this.onload) this.onload({ target: { result: this.result } });
    });

    const result = await compressImage(smallFile);

    expect(fileReaderMock.readAsDataURL).toHaveBeenCalledWith(smallFile);
    expect(result).toBe('data:image/png;base64,small-content');
    // Should NOT create Image or Canvas for small files
    expect(window.Image).not.toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalledWith('canvas');
  });

  it('compresses large files using Canvas', async () => {
    const largeFile = new File(['large'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    // Setup FileReader behavior for main path
    fileReaderMock.readAsDataURL.mockImplementation(function () {
      setTimeout(() => {
        // Step 1: FileReader reads file
        this.result = 'data:image/png;base64,large-source-content';
        if (this.onload) this.onload({ target: { result: this.result } });
      }, 0);
    });

    // We can't easily wait for the internal Image.onload, so we need to inspect the Image mock
    // Wrapper promise to trigger the image loading logic
    const promise = compressImage(largeFile);

    // Check if FileReader started (synchronous part)
    expect(fileReaderMock.readAsDataURL).toHaveBeenCalled();

    // Wait for FileReader to complete (async part)
    // We can verify Image hasn't been created YET immediately if needed, but due to setTimeout it's surely not.

    // We need to wait for the setTimeout to fire. `await new Promise(r => setTimeout(r, 0))` might work if timers are real.
    // Or we can use jest fake timers. But let's try waiting.
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Now FileReader onload should have fired
    expect(window.Image).toHaveBeenCalled();
    expect(imageMock.src).toBe('data:image/png;base64,large-source-content');

    // Simulate Image loading
    imageMock.width = 2000;
    imageMock.height = 1000;
    if (imageMock.onload) imageMock.onload();

    const result = await promise;

    // Verify resizing logic
    // Width 2000 -> Scaled to 1920
    expect(canvasMock.width).toBe(1920);
    // Height 1000 -> Scaled proportionally: 1000 * (1920/2000) = 960
    expect(canvasMock.height).toBe(960);
    expect(contextMock.drawImage).toHaveBeenCalledWith(imageMock, 0, 0, 1920, 960);
    expect(canvasMock.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7);
    expect(result).toBe('data:image/jpeg;base64,compressed-result');
  });

  it('rejects if FileReader fails', async () => {
    const file = new File(['err'], 'err.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 }); // Small file path

    // Setup FileReader to fail
    fileReaderMock.readAsDataURL.mockImplementation(function () {
      setTimeout(() => {
        if (this.onerror) this.onerror(new Error('FileReader Error'));
      }, 0);
    });

    await expect(compressImage(file)).rejects.toThrow('FileReader Error');
  });

  it('rejects if Image loading fails (large file path)', async () => {
    const largeFile = new File(['large'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    // Setup FileReader behavior for main path (should succeed reading file)
    fileReaderMock.readAsDataURL.mockImplementation(function () {
      setTimeout(() => {
        this.result = 'data:image/png;base64,large-source-content';
        if (this.onload) this.onload({ target: { result: this.result } });
      }, 0);
    });

    const promise = compressImage(largeFile);

    // Wait for FileReader
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Simulate Image error
    if (imageMock.onerror) imageMock.onerror(new Error('Image Load Error'));

    await expect(promise).rejects.toThrow('Image Load Error');
  });
});
