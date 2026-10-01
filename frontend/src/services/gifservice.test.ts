import { beforeEach, describe, expect, it, vi } from "vitest";
import { GifService } from "./gifservice";
import { createGif } from "../test/factories";

describe("GifService", () => {
  const fetchMock = vi.spyOn(globalThis, "fetch");
  let gifService: GifService;

  beforeEach(() => {
    fetchMock.mockReset();
    gifService = new GifService();
  });

  it("uses the provided base URL", async () => {
    gifService = new GifService("http://localhost:3000");

    fetchMock.mockResolvedValue(new Response(JSON.stringify([])));

    const formData = new FormData();

    await gifService.save(formData);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "http://localhost:3000/gifs",
      { method: "POST", body: formData },
    );
  });

  it("fetches /gif endpoint on getAll", async () => {
    const response = {
      items: [],
      page: 1,
      page_size: 10,
      pages: 0,
      total: 0,
    };
    fetchMock.mockResolvedValue(Response.json(response));

    const result = await gifService.getAll(1);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "/gifs?page=1&page_size=10&sort_order=asc",
      {
        signal: undefined,
      },
    );

    expect(result).toEqual(response);
  });

  it("returns saved gifs", async () => {
    const gifs = [createGif()];

    fetchMock.mockResolvedValue(Response.json(gifs));

    const formData = new FormData();

    const result = await gifService.save(formData);

    expect(result).toEqual(gifs);
  });

  it("raises an exception on invalid response from getAll()", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    await expect(gifService.getAll(1)).rejects.toThrow("HTTP error: 400");
  });

  it("raises an exception on invalid response from save()", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    const formData = new FormData();

    await expect(gifService.save(formData)).rejects.toThrow(
      /^HTTP error: 400 Invalid GIF$/,
    );
  });

  it("calls fetch from delete()", async () => {
    fetchMock.mockResolvedValue(new Response());

    await gifService.delete(1);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/gifs/1", {
      method: "DELETE",
    });
  });

  it("raises an exception on invalid response from delete()", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ detail: "Invalid GIF" }, { status: 400 }),
    );

    await expect(gifService.delete(1)).rejects.toThrow("HTTP error: 400");
  });
});
