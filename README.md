# Open Feature Flag SDK

A small React SDK that loads feature values from an evaluation API and exposes
them through OpenFeature. It is designed to be shared by React applications
and microfrontends.

## Requirements

- Node.js 20 or newer
- React 18 or newer
- An evaluation API implementing the endpoints below

## Local development

```bash
npm install
npm run dev
```

This starts the example React app and a local mock evaluation API at
`http://127.0.0.1:9099`. The mock key `dev-client-key` is for local development
only. React and React DOM are peer dependencies of the SDK package.

## Initialize before rendering

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  FeatureFlagProvider,
  initializeFeatureFlags,
} from "@yashaswis/open-feature-flag-sdk";
import App from "./App";

async function start() {
  await initializeFeatureFlags({
    apiKey: import.meta.env.VITE_FEATURE_FLAG_API_KEY,
    environment: "development",
    subjectId: "user-123",
    baseUrl: "http://localhost:9099",
  });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </StrictMode>,
  );
}

void start();
```

Use a public, restricted client key for browser applications. Never put a
server-side secret in a frontend bundle.

## Gate UI

```tsx
import { FeatureFlag } from "@yashaswis/open-feature-flag-sdk";

export function Dashboard() {
  return (
    <FeatureFlag
      flagKey="new-dashboard"
      defaultValue={false}
      fallback={<p>The dashboard is unavailable.</p>}
    >
      <NewDashboard />
    </FeatureFlag>
  );
}
```

`defaultValue` is used when a value cannot be resolved. `matchValue` can be
used for non-boolean flags, for example to render an admin panel only when
`user-role` resolves to `"admin"`.

## Evaluate flags through the API

```tsx
import { useFeatureFlagApi } from "@yashaswis/open-feature-flag-sdk";

function FlagSummary() {
  const { data, loading, error } = useFeatureFlagApi({
    apiKey: import.meta.env.VITE_FEATURE_FLAG_API_KEY,
    environment: "development",
    subjectId: "user-123",
  });

  if (loading) return <p>Loading flags...</p>;
  if (error) return <p role="alert">{error}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Pass `flagKey` to evaluate one flag. The hook cancels obsolete requests when
its inputs change or the component unmounts.

## API contract

The SDK sends `POST` requests with JSON bodies and an `X-API-Key` header:

| Purpose | Endpoint | Response |
| --- | --- | --- |
| Evaluate all flags | `/v1/flags/evaluate-all` | `{ "values": { "new-dashboard": true } }` |
| Evaluate one flag | `/v1/flags/{key}/evaluate` | `{ "value": true }` |

Request body:

```json
{
  "subjectId": "user-123",
  "environment": "development",
  "attributes": {}
}
```

Set `baseUrl` to the API origin; it defaults to `http://localhost:9099`.
`initializeFeatureFlags` rejects on network errors, unsuccessful HTTP
responses, or malformed payloads instead of silently enabling or disabling
features.

## Build and test

```bash
npm test
npm run build
```

`npm run build:sdk` creates the ESM, CommonJS, and TypeScript declaration
outputs in `lib/`. Once the package is published, install it with:

```bash
npm install @yashaswis/open-feature-flag-sdk
```
