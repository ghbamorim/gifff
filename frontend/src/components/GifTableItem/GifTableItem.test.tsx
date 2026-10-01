import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGif, createVideo } from "../../test/factories";
import { intersectionObserverCallback } from "../../test/setup";
import { GifTableItem } from "./GifTableItem";

const gif = createGif();

const video = createVideo();

const createIntersectionEntry = (isIntersecting: boolean, target: Element) =>
  ({
    isIntersecting,
    target,
  }) as IntersectionObserverEntry;

describe("GifTableItem", () => {
  beforeEach(() => vi.restoreAllMocks());

  it.each([
    { type: "gif", gif, label: "GIF" },
    { type: "video", gif: video, label: "▶ MP4" },
  ])("renders a $type", ({ gif, label }) => {
    render(<GifTableItem gif={gif} onDelete={vi.fn()}></GifTableItem>);

    const element = screen.getByText(label);
    expect(element).toBeInTheDocument();
  });

  it.each([
    { type: "gif", gif, prototype: HTMLImageElement.prototype },
    { type: "video", gif: video, prototype: HTMLVideoElement.prototype },
  ])("calls fullscreen for $type element", async ({ gif, prototype }) => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });

    const user = userEvent.setup();
    render(<GifTableItem gif={gif} onDelete={vi.fn()}></GifTableItem>);
    const element = screen.getByRole("button", { name: "Fullscreen" });
    await user.click(element);

    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it.each([
    { confirm: true, expectedCalls: 1 },
    { confirm: false, expectedCalls: 0 },
  ])(
    "handles delete after confirm dialog returns $confirm",
    async ({ confirm, expectedCalls }) => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      vi.spyOn(window, "confirm").mockReturnValue(confirm);

      render(<GifTableItem gif={gif} onDelete={onDelete}></GifTableItem>);

      const element = screen.getByRole("button", { name: "Delete" });

      await user.click(element);

      expect(window.confirm).toHaveBeenCalledExactlyOnceWith("Confirm delete?");

      expect(onDelete).toHaveBeenCalledTimes(expectedCalls);
    },
  );

  it.each([
    { action: "plays", viewPortAction: "enters", isIntersecting: true },
    { action: "pauses", viewPortAction: "leaves", isIntersecting: false },
  ])("$action the video when it $viewPortAction", ({ isIntersecting }) => {
    const play = vi
      .spyOn(HTMLVideoElement.prototype, "play")
      .mockResolvedValue(undefined);

    const pause = vi
      .spyOn(HTMLVideoElement.prototype, "pause")
      .mockImplementation(() => {});

    render(<GifTableItem gif={video} onDelete={vi.fn()}></GifTableItem>);

    const videoElement = screen.getByTestId("media");

    intersectionObserverCallback!(
      [createIntersectionEntry(isIntersecting, videoElement!)],
      {} as IntersectionObserver,
    );

    const expected = isIntersecting ? play : pause;
    const notExpected = isIntersecting ? pause : play;

    expect(expected).toHaveBeenCalled();
    expect(notExpected).not.toHaveBeenCalled();
  });
});
