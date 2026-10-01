import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GifService, PAGE_SIZE } from "../../services/gifservice";
import { createGif } from "../../test/factories";
import type { GifPage } from "../../types/types";
import { useGifs } from "./useGifs";

vi.mock("../../services/gifservice");

describe("useGifs", () => {
  beforeEach(() => vi.resetAllMocks());

  it("should have idle status initially", () => {
    const { result } = renderHook(() => useGifs());
    expect(result.current.status).toBe("idle");
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

    expect(getAllMock).toHaveBeenCalledOnce();

    getAllMock.mockClear();

    await act(async () => await result.current.handleLoadMore());

    expect(getAllMock).not.toHaveBeenCalled();
  });

  it("should not load gifs concurrently", async () => {
    let resolvePromise!: (value: GifPage) => void;
    const getAll = vi.mocked(GifService.prototype.getAll).mockImplementation(
      () =>
        new Promise<GifPage>((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { result } = renderHook(() => useGifs());

    let firstCall: Promise<void>;
    await act(async () => {
      firstCall = result.current.handleLoadMore();

      await result.current.handleLoadMore();
    });

    expect(getAll).toHaveBeenCalledOnce();

    await act(async () => {
      resolvePromise({
        items: [],
        page: 1,
        page_size: PAGE_SIZE,
        pages: 2,
        total: 0,
      });

      await firstCall;
    });
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

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe(errorDescription);
    },
  );

  it("should save gifs", async () => {
    const gifs = [createGif(), createGif({ id: 2 })];

    vi.mocked(GifService.prototype.save).mockResolvedValue(gifs);

    const { result } = renderHook(() => useGifs());

    const formData = new FormData();

    await act(async () => await result.current.saveGif(formData));

    expect(GifService.prototype.save).toHaveBeenCalledWith(formData);

    expect(result.current.gifs).toEqual(gifs);
    expect(result.current.status).toBe("idle");
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

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe(errorDescription);
    },
  );

  it("should toggle sort order", () => {
    const { result } = renderHook(() => useGifs());

    expect(result.current.sortOrder).toBe("desc");

    act(() => result.current.toggleSortOrder());

    expect(result.current.sortOrder).toBe("asc");

    act(() => result.current.toggleSortOrder());

    expect(result.current.sortOrder).toBe("desc");
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
    expect(result.current.status).toBe("idle");
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

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe(errorDescription);
    },
  );
});
