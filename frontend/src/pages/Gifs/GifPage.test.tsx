import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GifPage } from "./GifPage";

describe("GifPage", () => {
  it("renders GifPage component", () => {
    render(<GifPage />);
    const element = screen.getByRole("button", { name: "SortOrder" });
    expect(element).toBeInTheDocument();
  });
});
