import { beforeEach, describe, expect, it, vi } from "vitest";
import { GifService } from "./gifservice";

describe("GifService", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  let gifService: GifService;

  beforeEach(() => {
    fetch.mockReset();
    gifService = new GifService();
  });

  it("Uses the provided base URL", async () => {
    gifService = new GifService("http://localhost:3000");

    fetch.mockResolvedValue(new Response(JSON.stringify([])));

    const formData = new FormData();

    await gifService.save(formData);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "http://localhost:3000/gifs",
      { method: "POST", body: formData },
    );
  });

  it("Fetches /gif endpoint on getAll", async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify([])));

    await gifService.getAll(1);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "/gifs?page=1&page_size=10&sort_order=asc",
      {
        signal: undefined,
      },
    );
  });

  it("raises an exception on invalid response from getAll()", async () => {
    fetch.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    await expect(gifService.getAll(1)).rejects.toThrow("HTTP error: 400");
  });

  it("raises an exception on invalid response from save()", async () => {
    fetch.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    const formData = new FormData();

    await expect(gifService.save(formData)).rejects.toThrow(
      /^HTTP error: 400 Invalid GIF$/,
    );
  });

  it("Calls fetch from delete()", async () => {
    fetch.mockResolvedValue(new Response());

    await gifService.delete(1);

    expect(fetch).toHaveBeenCalledExactlyOnceWith("/gifs/1", {
      method: "DELETE",
    });
  });

  it("raises an exception on invalid response from delete()", async () => {
    fetch.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    await expect(gifService.delete(1)).rejects.toThrow("HTTP error: 400");
  });
});
