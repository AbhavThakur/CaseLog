import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => cleanup());

// Browser API polyfills for jsdom
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(cb, 0) as unknown as number;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Mock Firebase
vi.mock("../lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
  IS_DEV: true,
}));
