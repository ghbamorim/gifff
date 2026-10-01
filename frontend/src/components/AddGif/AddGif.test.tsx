import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddGif, MAX_UPLOAD_SIZE } from "./AddGif";

describe("AddGif", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("renders AddGif component", () => {
    render(<AddGif onSave={vi.fn()}></AddGif>);

    const element = screen.getByTestId("gifInput");

    expect(element).toBeInTheDocument();
  });

  it("saves gifs", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<AddGif onSave={onSave} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file1 = new File(["gif content"], "test.gif", { type: "image/gif" });

    const file2 = new File(["gif content"], "test1.gif", { type: "image/gif" });

    await user.upload(input, [file1, file2]);

    expect(onSave).toHaveBeenCalledOnce();

    const formData = onSave.mock.calls[0][0] as FormData;

    expect(formData.getAll("files")).toEqual([file1, file2]);
  });

  it.each([{ files: [] }, { files: null }])(
    "does not call onSave when no files are selected",
    ({ files }) => {
      const onSave = vi.fn();

      render(<AddGif onSave={onSave} />);

      const input = screen.getByTestId("gifInput");

      fireEvent.change(input, {
        target: {
          files: files,
        },
      });

      expect(onSave).not.toHaveBeenCalled();
    },
  );

  it("blocks if exceeds max upload size", async () => {
    const user = userEvent.setup();

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    const onSave = vi.fn();

    render(<AddGif onSave={onSave}></AddGif>);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file1 = new File([new Uint8Array(MAX_UPLOAD_SIZE / 2)], "test.gif", {
      type: "image/gif",
    });

    const file2 = new File(
      [new Uint8Array(MAX_UPLOAD_SIZE / 2 + 1)],
      "test1.gif",
      {
        type: "image/gif",
      },
    );

    await user.upload(input, [file1, file2]);

    expect(alertMock).toHaveBeenCalledWith(
      `The total size of the files cannot exceed ${MAX_UPLOAD_SIZE} bytes`,
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});
