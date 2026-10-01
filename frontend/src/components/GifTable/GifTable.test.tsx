import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGif, createVideo } from "../../test/factories";
import { intersectionObserverCallback } from "../../test/setup";
import type { PageStatus } from "../../types/types";
import { GifTable } from "./GifTable";

describe("GifTable", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("renders gif and video items", () => {
    render(
      <GifTable
        gifs={[createGif(), createVideo({ id: 2 })]}
        onDelete={vi.fn()}
        onLoadMore={vi.fn()}
        status={"idle"}
        error={""}
      ></GifTable>,
    );
    const element = screen.getByTestId("GifTable");
    expect(element).toBeInTheDocument();

    const gifElement = screen.getByText("GIF");
    expect(gifElement).toBeInTheDocument();

    const videoElement = screen.getByText("▶ MP4");
    expect(videoElement).toBeInTheDocument();
  });

  it.each<{ status: PageStatus; text: string }>([
    { status: "loading", text: "Loading" },
    { status: "saving", text: "Saving" },
    { status: "deleting", text: "Deleting" },
    { status: "error", text: "An error" },
  ])("renders GifTable in $text state", ({ status, text }) => {
    render(
      <GifTable
        gifs={[]}
        onDelete={vi.fn()}
        onLoadMore={vi.fn()}
        status={status}
        error={status === "error" ? text : null}
      ></GifTable>,
    );
    const element = screen.getByText(text);
    expect(element).toBeInTheDocument();
  });

  it.each([
    { scenario: "enters", isIntersecting: true, expectedExecCount: 1 },
    { scenario: "does not enter", isIntersecting: false, expectedExecCount: 0 },
  ])(
    "loads more gifs when sentinel $scenario the viewport",
    ({ isIntersecting, expectedExecCount }) => {
      const onLoadMore = vi.fn();

      render(
        <GifTable
          gifs={[]}
          onDelete={vi.fn()}
          onLoadMore={onLoadMore}
          status={"idle"}
          error={""}
        ></GifTable>,
      );

      const createIntersectionEntry = (
        isIntersecting: boolean,
        target: Element,
      ) =>
        ({
          isIntersecting,
          target,
        }) as IntersectionObserverEntry;

      const element = screen.getByTestId("loadMoreRef");

      intersectionObserverCallback!(
        [createIntersectionEntry(isIntersecting, element!)],
        {} as IntersectionObserver,
      );

      expect(onLoadMore).toHaveBeenCalledTimes(expectedExecCount);
    },
  );
});
