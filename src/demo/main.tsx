import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  FeatureFlagProvider,
  initializeFeatureFlags,
} from "../index";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("The demo root element is missing.");
}

const root = createRoot(rootElement);
root.render(<p className="boot-message">Loading feature flags...</p>);

async function startDemo() {
  await initializeFeatureFlags({
    apiKey: import.meta.env.VITE_FEATURE_FLAG_API_KEY ?? "dev-client-key",
    environment: "development",
    subjectId: "demo-user",
    baseUrl:
      import.meta.env.VITE_FEATURE_FLAG_API_URL ?? "http://127.0.0.1:9099",
  });

  root.render(
    <StrictMode>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </StrictMode>,
  );
}

void startDemo().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Feature flag setup failed.";
  root.render(
    <main className="boot-error" role="alert">
      <p className="eyebrow">Could not start the demo</p>
      <h1>Feature flags are unavailable</h1>
      <p>{message}</p>
      <p>Make sure the local mock API is running, then refresh.</p>
    </main>,
  );
});
