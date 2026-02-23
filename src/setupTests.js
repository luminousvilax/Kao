import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url-id');
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLAnchorElement for downloads and clicks
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName) => {
  if (tagName === 'a') {
    const anchor = originalCreateElement('a');
    anchor.click = vi.fn(); // Mock the click method
    return anchor;
  }
  return originalCreateElement(tagName);
};

// Mock FileReader
class MockFileReader {
  constructor() {
    this.readAsText = vi.fn();
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
}
global.FileReader = MockFileReader;

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
