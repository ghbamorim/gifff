import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGifs } from "./useGifs";
import { GifService, PAGE_SIZE } from "../../services/gifservice";
import { createGif } from "../../test/factories";
import { act } from "react";

vi.mock("../../services/gifservice");

describe("useGifs", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("should create useGifs Hook", () => {
    const { result } = renderHook(() => {
      return useGifs();
    });
    expect(result.current.status).toEqual("idle");
  });

  it("should load gifs, if not at the last page", async () => {
    const gifs = [createGif(), createGif({ id: 2 })];
    const getAllMock = vi
      .mocked(GifService.prototype.getAll)
      .mockResolvedValue({
        items: gifs,
        page: 1,
        page_size: 2,
        pages: 1,
        total: 2,
      });

    const { result } = renderHook(() => useGifs());
    await act(async () => await result.current.handleLoadMore());

    expect(GifService.prototype.getAll).toHaveBeenCalledWith(
      1,
      PAGE_SIZE,
      "desc",
    );

    expect(result.current.gifs).toEqual(gifs);

    expect(GifService.prototype.getAll).toHaveBeenCalledOnce();

    getAllMock.mockClear();

    await act(async () => await result.current.handleLoadMore());

    expect(GifService.prototype.getAll).not.toHaveBeenCalled();
  });

  it.each([
    { errorDescription: "Unknown error", error: "other error" },
    { errorDescription: "known error", error: new Error("known error") },
  ])(
    "should handle $errorDescription at loading gifs",
    async ({ error, errorDescription }) => {
      vi.mocked(GifService.prototype.getAll).mockRejectedValue(error);

      const { result } = renderHook(() => useGifs());
      await act(async () => await result.current.handleLoadMore());

      expect(GifService.prototype.getAll).toHaveBeenCalledWith(
        1,
        PAGE_SIZE,
        "desc",
      );

      expect(result.current.status).toEqual("error");
      expect(result.current.error).toEqual(errorDescription);
    },
  );

  it("should save gifs", async () => {
    const gifs = [createGif(), createGif({ id: 2 })];

    const file1 = new File(["content-1"], "gif-1.gif", { type: "image/gif" });
    const file2 = new File(["content-2"], "gif-2.gif", { type: "image/gif" });

    vi.mocked(GifService.prototype.save).mockResolvedValue(gifs);

    const { result } = renderHook(() => useGifs());

    const formData = new FormData();

    const files = Array.from([file1, file2]);

    files.forEach((file) => {
      formData.append("files", file);
    });

    await act(async () => await result.current.saveGif(formData));

    expect(GifService.prototype.save).toHaveBeenCalledOnce();

    expect(result.current.gifs).toEqual(gifs);
  });

  it.each([
    { errorDescription: "Unknown error", error: "other error" },
    { errorDescription: "known error", error: new Error("known error") },
  ])(
    "should handle $errorDescription at saving gifs",
    async ({ error, errorDescription }) => {
      vi.mocked(GifService.prototype.save).mockRejectedValue(error);

      const { result } = renderHook(() => useGifs());

      const formData = new FormData();

      await act(async () => await result.current.saveGif(formData));

      expect(GifService.prototype.save).toHaveBeenCalledOnce();

      expect(result.current.status).toEqual("error");
      expect(result.current.error).toEqual(errorDescription);
    },
  );

  it("Should toggle sort order", async () => {
    const { result } = renderHook(() => useGifs());

    expect(result.current.sortOrder).toEqual("desc");

    act(() => result.current.toggleSortOrder());

    expect(result.current.sortOrder).toEqual("asc");

    act(() => result.current.toggleSortOrder());

    expect(result.current.sortOrder).toEqual("desc");
  });

  it("should delete a gif", async () => {
    const gifs = [createGif(), createGif({ id: 2 })];

    vi.mocked(GifService.prototype.getAll).mockResolvedValue({
      items: gifs,
      page: 1,
      page_size: 2,
      pages: 1,
      total: 2,
    });

    vi.mocked(GifService.prototype.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGifs());

    await act(async () => await result.current.handleLoadMore());

    expect(result.current.gifs).toEqual(gifs);

    await act(async () => await result.current.handleDelete(2));

    expect(GifService.prototype.delete).toHaveBeenCalledWith(2);

    const expectedGifs = gifs.filter((gif) => gif.id !== 2);

    expect(result.current.gifs).toEqual(expectedGifs);
  });

  it.each([
    { errorDescription: "Unknown error", error: "other error" },
    { errorDescription: "known error", error: new Error("known error") },
  ])(
    "should handle $errorDescription at deleting a gif",
    async ({ error, errorDescription }) => {
      vi.mocked(GifService.prototype.delete).mockRejectedValue(error);

      const { result } = renderHook(() => useGifs());

      await act(async () => await result.current.handleDelete(1));

      expect(GifService.prototype.delete).toHaveBeenCalledOnce();

      expect(result.current.status).toEqual("error");
      expect(result.current.error).toEqual(errorDescription);
    },
  );
});
