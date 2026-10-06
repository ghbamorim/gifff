import { type FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  return (
    <div role="alert">
      <strong>Something went wrong</strong>
      <p>An unexpected error occurred while rendering the page.</p>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
};
