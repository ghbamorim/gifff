import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthService } from "./services/authService";
import { act } from "react";

describe("App", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders error message", async () => {
    const checkSession = vi
      .spyOn(AuthService.prototype, "checkSession")
      .mockRejectedValue(new Error());

    render(<App />);

    const element = await screen.findByText(
      "Unable to verify session. Please refresh.",
    );
    expect(element).toBeInTheDocument();
    expect(checkSession).toHaveBeenCalledOnce();
  });

  it("renders Login component", async () => {
    const user = userEvent.setup();

    vi.spyOn(AuthService.prototype, "checkSession").mockResolvedValue(false);

    vi.spyOn(AuthService.prototype, "login").mockResolvedValue(undefined);

    render(<App />);

    const element = await screen.findByRole("heading", { name: "Sign in" });

    expect(element).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Email"), "test@email.com");
    await user.type(screen.getByPlaceholderText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("button", { name: "SortOrder" }),
    ).toBeInTheDocument();
  });

  it("shows error message if login fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(AuthService.prototype, "checkSession").mockResolvedValue(false);

    vi.spyOn(AuthService.prototype, "login").mockRejectedValue(
      new Error("Login failed"),
    );

    render(<App />);

    await user.type(
      await screen.findByPlaceholderText("Email"),
      "test@email.com",
    );
    await user.type(await screen.findByPlaceholderText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const element = await screen.findByText("Invalid email or password", {
      selector: '[role="alert"]',
    });

    expect(element).toBeInTheDocument();
  });

  it("renders App component", async () => {
    const checkSession = vi
      .spyOn(AuthService.prototype, "checkSession")
      .mockResolvedValue(true);

    render(<App />);
    const element = await screen.findByRole("button", { name: "SortOrder" });
    expect(element).toBeInTheDocument();
    expect(checkSession).toHaveBeenCalledOnce();
  });

  it("does not update state after unmount", async () => {
    let resolveSession!: (value: boolean) => void;

    vi.spyOn(AuthService.prototype, "checkSession").mockImplementation(
      () => new Promise<boolean>((resolve) => (resolveSession = resolve)),
    );

    const { unmount } = render(<App />);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();

    unmount();

    await act(async () => resolveSession(true));
  });

  it("doesn't update error state after unmount", async () => {
    let rejectSession!: (error: Error) => void;

    vi.spyOn(AuthService.prototype, "checkSession").mockImplementation(
      () =>
        new Promise<boolean>((_, reject) => {
          rejectSession = reject;
        }),
    );

    vi.spyOn(console, "log").mockImplementation(() => {});

    const { unmount } = render(<App />);

    unmount();

    await act(async () => rejectSession(new Error("Session failed")));

    expect(console.log).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: "Session failed" }),
    );
  });
});
