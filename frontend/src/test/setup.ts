import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

export let intersectionObserverCallback:
  | IntersectionObserverCallback
  | undefined;

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    intersectionObserverCallback = callback;
  }
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
