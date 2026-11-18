# OpenFeature Flag SDK

## 1. Overview

The OpenFeature Flag SDK is a reusable React SDK that helps frontend applications integrate with the backend feature flag service.

It uses the OpenFeature SDK to register and manage feature flags. Applications can use the provided `FeatureFlag` component to conditionally show or hide UI elements based on flag values.

The SDK also provides a `useFeatureFlagApi` hook to retrieve feature flag values directly from the backend.

The SDK is designed to be shared across multiple React applications and microfrontends through an internal npm registry.

## 2. Key Features

- **Centralized initialization:** Initialize feature flags by providing the API key, environment, and subject ID.
- **OpenFeature integration:** Uses OpenFeature and `TypedInMemoryProvider` to register evaluated flag values.
- **Conditional rendering:** Use the `FeatureFlag` component to show or hide UI elements.
- **API integration:** Fetch all feature flags or evaluate an individual flag using `useFeatureFlagApi`.
- **Reusable package:** Install and use the same SDK across multiple React applications.
- **Microfrontend support:** Share the SDK between host and remote applications.
- **TypeScript support:** Provides typed exports and component props.

## 3. Architecture

The SDK acts as an integration layer between React applications, OpenFeature, and the backend feature flag service.

### How it works

1. The host application initializes the SDK using `initializeFeatureFlags()`.
2. The SDK sends a request to the backend to retrieve evaluated feature flags.
3. The backend returns the evaluated flag values.
4. The SDK converts these values into the configuration required by `TypedInMemoryProvider`.
5. The provider is registered with OpenFeature.
6. The application is wrapped with `FeatureFlagProvider`.
7. Components use `FeatureFlag` to render UI based on the registered flag values.

### Architecture flow

```text
React Host Application
        |
        v
initializeFeatureFlags()
        |
        v
Feature Flag SDK
        |
        v
Backend Feature Flag API
        |
        v
Evaluated Flag Values
        |
        v
TypedInMemoryProvider
        |
        v
OpenFeature
        |
        v
FeatureFlagProvider
        |
        v
Host Application + Remote Applications
        |
        v
FeatureFlag Component
        |
        v
Conditional UI Rendering
```

## 4. Installation

The SDK is published to the internal npm registry.

Configure the internal registry in your project's `.npmrc` file:

```ini
@lendistry:registry=<INTERNAL_NPM_REGISTRY_URL>
```

Install the SDK:

```bash
npm install @lendistry/openfeature
```

Make sure the application has compatible React and React DOM versions installed.

## 5. Initialization

Initialize the SDK once in the host application before rendering components that consume feature flags.

### Example

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import {
  initializeFeatureFlags,
  FeatureFlagProvider,
} from "@lendistry/openfeature";

import App from "./App";

async function bootstrap() {
  await initializeFeatureFlags({
    apiKey: "your-api-key",
    environment: "dev",
    subjectId: "user-123",
  });

  ReactDOM.createRoot(
    document.getElementById("root")!
  ).render(
    <FeatureFlagProvider>
      <App />
    </FeatureFlagProvider>
  );
}

bootstrap();
```

### Initialization parameters

| Parameter | Description |
|---|---|
| `apiKey` | API key used to authenticate with the backend |
| `environment` | Environment for which flags should be evaluated |
| `subjectId` | Identifier of the user or subject for evaluation |

The SDK retrieves the evaluated flags and registers them with the OpenFeature provider.

**Note:** Initialize the SDK before rendering components that depend on feature flags.

## 6. Using FeatureFlag

The `FeatureFlag` component is used to conditionally render UI based on a feature flag.

### Example: Show a feature when the flag is enabled

```tsx
import { FeatureFlag } from "@lendistry/openfeature";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <FeatureFlag flagKey="new-dashboard">
        <div>
          <h2>New Dashboard</h2>
          <p>Welcome to the new dashboard!</p>
        </div>
      </FeatureFlag>
    </div>
  );
}

export default Dashboard;
```

When `new-dashboard` evaluates to `true`, the child component is displayed. When it evaluates to `false`, the child component is hidden.

### Example: Render different UI based on a flag value

```tsx
<FeatureFlag
  flagKey="loan-application-flow-v2"
  matchValue={true}
>
  <NewLoanApplication />
</FeatureFlag>
```

The component supports the props exposed by the underlying OpenFeature React SDK `FeatureFlag` component.

## 7. Using useFeatureFlagApi

The `useFeatureFlagApi` hook retrieves feature flag values directly from the backend.

It supports two use cases:

- Retrieve all evaluated feature flags.
- Retrieve the evaluated value of an individual feature flag.

### Example: Retrieve all feature flags

```tsx
import { useFeatureFlagApi } from "@lendistry/openfeature";

function FeatureFlags() {
  const { data, loading, error } = useFeatureFlagApi({
    apiKey: "your-api-key",
    environment: "dev",
    subjectId: "user-123",
  });

  if (loading) return <p>Loading feature flags...</p>;

  if (error) return <p>{error}</p>;

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
}

export default FeatureFlags;
```

### Example: Retrieve an individual feature flag

Pass `flagKey` to retrieve a specific flag.

```tsx
const { data, loading, error } = useFeatureFlagApi({
  apiKey: "your-api-key",
  environment: "dev",
  subjectId: "user-123",
  flagKey: "new-dashboard",
});
```

### Hook return values

| Property | Description |
|---|---|
| `data` | Evaluated flag value or object containing all flag values |
| `loading` | Indicates whether the API request is in progress |
| `error` | Error message if the request fails |

**Note:** This hook makes a direct backend API request. It is separate from reading values already registered with the OpenFeature provider.

## 8. Microfrontend Integration

The SDK can be shared between a host application and multiple remote applications.

The recommended approach is to initialize the SDK once in the host application and allow remote applications to consume the same OpenFeature context.

### Host application

The host application is responsible for initializing the SDK and providing the `FeatureFlagProvider`.

```tsx
import {
  initializeFeatureFlags,
  FeatureFlagProvider,
} from "@lendistry/openfeature";

async function bootstrap() {
  await initializeFeatureFlags({
    apiKey: "your-api-key",
    environment: "dev",
    subjectId: "user-123",
  });

  root.render(
    <FeatureFlagProvider>
      <App />
    </FeatureFlagProvider>
  );
}

bootstrap();
```

The host can render remote applications inside the provider:

```tsx
function App() {
  return (
    <div>
      <h1>Host Application</h1>
      <RemoteDashboard />
      <RemoteLoanApplication />
    </div>
  );
}
```

### Remote application

Each remote application installs the SDK:

```bash
npm install @lendistry/openfeature
```

The remote application can directly use the `FeatureFlag` component.

```tsx
import { FeatureFlag } from "@lendistry/openfeature";

function RemoteDashboard() {
  return (
    <FeatureFlag flagKey="new-dashboard">
      <div>
        <h2>New Dashboard Feature</h2>
      </div>
    </FeatureFlag>
  );
}

export default RemoteDashboard;
```

The remote application does not need to initialize the SDK again when it is rendered inside the host application's shared provider tree.

### Module Federation configuration

To ensure that the host and remote applications use the same React and OpenFeature context instances, configure the following dependencies as singletons.

**Host configuration example:**

```js
new ModuleFederationPlugin({
  name: "host",

  remotes: {
    dashboard: "dashboard@http://localhost:3001/remoteEntry.js",
  },

  shared: {
    react: {
      singleton: true,
      requiredVersion: "^18.0.0",
    },

    "react-dom": {
      singleton: true,
      requiredVersion: "^18.0.0",
    },

    "@openfeature/react-sdk": {
      singleton: true,
    },

    "@lendistry/openfeature": {
      singleton: true,
    },
  },
});
```

**Remote configuration example:**

```js
new ModuleFederationPlugin({
  name: "dashboard",

  filename: "remoteEntry.js",

  exposes: {
    "./Dashboard": "./src/Dashboard",
  },

  shared: {
    react: {
      singleton: true,
      requiredVersion: "^18.0.0",
    },

    "react-dom": {
      singleton: true,
      requiredVersion: "^18.0.0",
    },

    "@openfeature/react-sdk": {
      singleton: true,
    },

    "@lendistry/openfeature": {
      singleton: true,
    },
  },
});
```

**Important:**

- Initialize the SDK only once in the host application.
- The host must wrap the component tree containing the remote applications with `FeatureFlagProvider`.
- Host and remote applications should share the same React and OpenFeature SDK instances.
- React context does not automatically cross separate React roots or isolated runtimes. Such applications need their own provider setup or an explicit context-sharing solution.
- Ensure the shared dependency versions are compatible across applications.

## 9. API Contract

The SDK communicates with the backend through the following endpoints.

### 9.1 Evaluate all feature flags

**Endpoint**

```http
POST /v1/flags/evaluate-all
```

**Headers**

```http
Content-Type: application/json
X-API-Key: <API_KEY>
```

**Request body**

```json
{
  "subjectId": "user-123",
  "environment": "dev",
  "attributes": {}
}
```

**Response**

```json
{
  "values": {
    "new-dashboard": true,
    "enable-payment": false,
    "show-reports": true
  }
}
```

The SDK uses the returned `values` object to register the feature flags with the OpenFeature provider.

### 9.2 Evaluate an individual feature flag

**Endpoint**

```http
POST /v1/flags/{flagKey}/evaluate
```

Example:

```http
POST /v1/flags/new-dashboard/evaluate
```

**Headers**

```http
Content-Type: application/json
X-API-Key: <API_KEY>
```

**Request body**

```json
{
  "subjectId": "user-123",
  "environment": "dev",
  "attributes": {}
}
```

**Response**

```json
{
  "value": true
}
```

The SDK returns the evaluated `value` to the calling application.

### API summary

| Endpoint | Purpose |
|---|---|
| `POST /v1/flags/evaluate-all` | Retrieves all evaluated feature flags |
| `POST /v1/flags/{flagKey}/evaluate` | Retrieves the evaluated value of an individual flag |

## 10. Local Development

Follow these steps to run the SDK demo locally.

### Prerequisites

- Node.js
- npm
- Git

### Step 1: Clone the repository

```bash
git clone https://github.com/yashaswis-24/open-feature-flag-sdk.git
cd open-feature-flag-sdk
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Build the SDK

```bash
cd src/sdk
npm run build
cd ../..
```

### Step 4: Start the mock backend server

Open a terminal from the repository root:

```bash
node mock-server/server.cjs
```

The mock server runs at:

```text
http://localhost:9099
```

The development API key is:

```text
dev-api-key
```

### Step 5: Run the demo application

Open another terminal from the repository root:

```bash
npm run dev
```

The Vite development server will provide a local URL for the demo application.

**Note:** The current SDK API implementation uses `http://localhost:9099` as its base URL. The mock server must be running for local API calls to succeed.

## 11. Publishing

Only SDK maintainers should publish new versions.

### Step 1: Navigate to the SDK package

```bash
cd src/sdk
```

### Step 2: Update the package version

Update the version in `package.json`.

For example:

```json
{
  "name": "@lendistry/openfeature",
  "version": "0.1.1"
}
```

### Step 3: Build the SDK

```bash
npm run build
```

### Step 4: Verify the package contents

```bash
npm pack --dry-run
```

Check that the package contains the required compiled files, type declarations, and README.

### Step 5: Authenticate with the internal npm registry

```bash
npm login --registry=<INTERNAL_NPM_REGISTRY_URL>
```

### Step 6: Publish the package

```bash
npm publish --registry=<INTERNAL_NPM_REGISTRY_URL>
```

After publishing, application teams can install the updated version:

```bash
npm install @lendistry/openfeature@0.1.1
```

## 12. Troubleshooting

| Issue | Possible cause | Solution |
|---|---|---|
| Feature is not displayed | Flag evaluates to `false` | Verify the flag value returned by the backend |
| API request fails | Mock server or backend is unavailable | Verify the server URL and confirm that the service is running |
| API returns unauthorized | Invalid API key | Verify the API key and authentication configuration |
| Feature flag is undefined | SDK was not initialized before rendering | Initialize the SDK before rendering the application |
| Remote application cannot access flags | Remote is outside the host provider tree | Render the remote inside `FeatureFlagProvider` |
| Multiple React context instances | Dependencies are not shared correctly | Configure React, React DOM, OpenFeature React SDK, and the SDK as Module Federation singletons |
| TypeScript cannot find SDK exports | Package is not built or installed correctly | Run the SDK build and reinstall the package |
| New package version is not available | Package manager is using a cached or older version | Verify the published version and update the dependency |

---

**Package name:** `@lendistry/openfeature`

**Repository:** https://github.com/yashaswis-24/open-feature-flag-sdk