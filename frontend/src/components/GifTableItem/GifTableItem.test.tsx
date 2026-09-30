import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Gif } from "../../types/types";
import { render, screen } from "@testing-library/react";
import { GifTableItem } from "./GifTableItem";
import userEvent from "@testing-library/user-event";
import { intersectionObserverCallback } from "../../test/setup";

const gif: Gif = {
  id: 1,
  filename: "cat.gif",
  content_type: "image/gif",
  created_at: Date.now().toString(),
};

const video: Gif = {
  id: 2,
  filename: "cat.mp4",
  content_type: "video/mp4",
  created_at: Date.now().toString(),
};

describe("GifTableItem", () => {
  beforeEach(() => vi.restoreAllMocks());

  it.each([
    { type: "gif", gif },
    { type: "video", gif: video },
  ])("renders a $type", ({ gif }) => {
    render(<GifTableItem gif={gif} onDelete={vi.fn()}></GifTableItem>);
    const element = screen.getByTestId("media");
    expect(element).toBeInTheDocument();
  });

  it.each([
    { type: "gif", gif, prototype: HTMLImageElement.prototype },
    { type: "video", gif: video, prototype: HTMLVideoElement.prototype },
  ])("requests fullscreen for a $type", async ({ gif, prototype }) => {
    const user = userEvent.setup();

    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    prototype.requestFullscreen = requestFullscreen;

    render(<GifTableItem gif={gif} onDelete={vi.fn()}></GifTableItem>);
    const element = screen.getByRole("button", { name: "Fullscreen" });
    await user.click(element);

    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it.each([
    { confirmed: true, timesCalled: 1 },
    { confirmed: false, timesCalled: 0 },
  ])(
    "Handles delete click when window.confirm returns $confirmed",
    async ({ confirmed, timesCalled }) => {
      const onDelete = vi.fn();
      const user = userEvent.setup();

      vi.spyOn(window, "confirm").mockReturnValue(confirmed);

      render(<GifTableItem gif={gif} onDelete={onDelete}></GifTableItem>);
      const element = screen.getByRole("button", { name: "Delete" });
      await user.click(element);

      expect(window.confirm).toHaveBeenCalledWith("Confirm delete?");
      expect(onDelete).toHaveBeenCalledTimes(timesCalled);
    },
  );

  it.each([
    { action: "Plays", intsersecAction: "enters", isIntersecting: true },
    { action: "Pauses", intsersecAction: "leaves", isIntersecting: false },
  ])(
    "$action the video when it $intersecAction viewport",
    ({ isIntersecting }) => {
      const play = vi
        .spyOn(HTMLVideoElement.prototype, "play")
        .mockResolvedValue(undefined);

      const pause = vi.spyOn(HTMLVideoElement.prototype, "pause");

      render(<GifTableItem gif={gif} onDelete={vi.fn()}></GifTableItem>);

      const videoElement = screen.getByTestId("media");

      const createIntersectionEntry = (
        isIntersecting: boolean,
        target: Element,
      ) =>
        ({
          isIntersecting,
          target,
        }) as IntersectionObserverEntry;

      intersectionObserverCallback!(
        [createIntersectionEntry(isIntersecting, videoElement!)],
        {} as IntersectionObserver,
      );

      const expected = isIntersecting ? play : pause;
      const notExpected = isIntersecting ? pause : play;

      expect(expected).toHaveBeenCalled();
      expect(notExpected).not.toHaveBeenCalled();
    },
  );
});
