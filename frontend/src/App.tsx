import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { GifPage } from "./pages/Gifs/GifPage";
import { LoginPage } from "./pages/Gifs/Login/LoginPage";
import { AuthService } from "./services/auth";

const authService = new AuthService();

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const valid = await authService.checkSession();
        if (active) setAuthenticated(valid);
      } catch (error) {
        console.log(error);
        if (active) setSessionError(true);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (checkingSession) {
    return <main>Loading...</main>;
  }

  if (sessionError) {
    return <main>Unable to verify session. Please refresh.</main>;
  }

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
        {authenticated ? (
          <GifPage />
        ) : (
          <LoginPage onLogin={() => setAuthenticated(true)} />
        )}
      </ErrorBoundary>
    </main>
  );
}

export default App;
