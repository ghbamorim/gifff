import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders App component", () => {
    render(<App />);
    const element = screen.getByRole("button", { name: "SortOrder" });
    expect(element).toBeInTheDocument();
  });
});
