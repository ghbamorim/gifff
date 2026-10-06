import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { GifPage } from "./pages/Gifs/GifPage";

function App() {
  return (
    <main>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        /* v8 ignore next -- @preserve */
        onError={(error, info) =>
          console.error("Unexpected React error", {
            error,
            componentStack: info.componentStack,
          })
        }
      >
        <GifPage></GifPage>
      </ErrorBoundary>
    </main>
  );
}

export default App;
