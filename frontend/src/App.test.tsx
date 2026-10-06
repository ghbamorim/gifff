import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders App component", () => {
    render(<App />);
    const element = screen.getByRole("button", { name: "SortOrder" });
    expect(element).toBeInTheDocument();
  });
});
