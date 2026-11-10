import { afterEach, describe, expect, it, vi } from "vitest";

describe("settings", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses VITE_API_URL when defined", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:8000");
    vi.resetModules();

    const { settings } = await import("./settings");

    expect(settings.apiUrl).toBe("http://localhost:8000");
  });

  it("uses empty string when VITE_API_URL is undefined", async () => {
    vi.stubEnv("VITE_API_URL", undefined);
    vi.resetModules();

    const { settings } = await import("./settings");

    expect(settings.apiUrl).toBe("");
  });
});
