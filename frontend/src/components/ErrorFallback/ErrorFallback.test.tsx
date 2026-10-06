import { describe, expect, it, vi } from "vitest";
import { ErrorFallback } from "./ErrorFallback";
import { render, screen } from "@testing-library/react";

describe("ErrorFallback", () => {
  it("should render try again button", () => {
    render(
      <ErrorFallback
        error={"test"}
        resetErrorBoundary={vi.fn()}
      ></ErrorFallback>,
    );

    const element = screen.getByText("Try again");
    expect(element).toBeInTheDocument();
  });
});
