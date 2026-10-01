import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("renders Header component", () => {
    render(
      <Header
        onSave={vi.fn()}
        sortOrder="asc"
        onToggleSortOrder={vi.fn()}
      ></Header>,
    );
    const element = screen.getByRole("button", { name: "SortOrder" });
    expect(element).toBeInTheDocument();
  });
});
