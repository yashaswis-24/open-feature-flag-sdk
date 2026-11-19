# Lendistry OpenFeature SDK

## 1. Overview

The **Lendistry OpenFeature SDK** is a reusable React and TypeScript library that provides a standardized way for frontend applications and microfrontends to integrate with the Lendistry Feature Flag API.

The SDK integrates the OpenFeature SDK with the Lendistry backend, allowing applications to initialize feature flags, evaluate flag values, conditionally render UI components, and access OpenFeature functionality through a single package.

It is designed to be shared across multiple React applications and microfrontends through an internal npm registry.

## 2. Key Features

- **Centralized initialization:** Initialize the SDK once with API credentials and subject information.
- **OpenFeature integration:** Uses OpenFeature and `TypedInMemoryProvider` to register evaluated feature flags.
- **Conditional rendering:** Display or hide React components based on feature flag values.
- **React hooks:** Exposes OpenFeature React hooks for accessing flag values and evaluation details.
- **Direct API evaluation:** Provides `useFeatureFlagApi` for retrieving individual flag values directly from the backend.
- **Evaluation context:** Supports passing additional user and application attributes during evaluation.
- **Lifecycle hooks:** Supports registering custom hooks for evaluation lifecycle events.
- **OpenFeature utilities:** Exposes client access, context management, logging, hook registration, and shutdown functionality.
- **Microfrontend support:** Allows host and remote applications to consume a shared SDK integration.
- **TypeScript support:** Provides typed components, options, and public exports.

## 3. Architecture

The SDK acts as an integration layer between React applications, OpenFeature, and the Lendistry Feature Flag API.

### Initialization and evaluation flow

1. The host application calls `initializeFeatureFlags()`.
2. The SDK sends an API request to retrieve evaluated feature flags.
3. The backend returns the evaluated flag values.
4. The SDK converts the response into an OpenFeature-compatible configuration.
5. The SDK registers a `TypedInMemoryProvider` with OpenFeature.
6. The host application renders its component tree inside `FeatureFlagProvider`.
7. Host and remote components consume feature flags through the SDK.

### Architecture diagram

```text
              Host Application
                     |
                     v
          initializeFeatureFlags()
                     |
                     v
             Lendistry SDK
                     |
                     v
           Lendistry Backend API
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
             ----------------
             |              |
             v              v
        Host App        Remote Apps
             |              |
             ----------------
                     |
                     v
              FeatureFlag
              React Hooks
```

**Important:** Initialization fetches all flags and registers them with the in-memory provider. OpenFeature React hooks evaluate using the registered provider. They do not make a new backend request for every hook call.

`useFeatureFlagApi` is a separate mechanism that directly calls the backend.

## 4. Installation

Configure the internal npm registry in the application's `.npmrc` file.

```ini
@lendistry:registry=<INTERNAL_NPM_REGISTRY_URL>
```

Install the SDK:

```bash
npm install @lendistry/openfeature
```

### Peer dependencies

Applications using the SDK should have compatible versions of:

- React 18 or later
- React DOM 18 or later
- `@openfeature/react-sdk` compatible with the SDK package

Refer to the published package manifest for the exact supported versions.

## 5. SDK Initialization

Initialize the SDK once in the host application before rendering components that depend on feature flags.

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
| `apiKey` | API key used to authenticate backend requests |
| `subjectId` | Identifier of the user or subject for flag evaluation |

Initialize the SDK before rendering components that consume OpenFeature.

**Important:** Do not call `initializeFeatureFlags()` multiple times unnecessarily. The host application should own initialization.

## 6. FeatureFlag Component

The SDK provides a `FeatureFlag` component that wraps the OpenFeature React SDK component.

It allows developers to conditionally render UI based on a feature flag.

### Example: Show a feature when enabled

```tsx
import { FeatureFlag } from "@lendistry/openfeature";

function Dashboard() {
  return (
    <FeatureFlag
      flagKey="new-dashboard"
      defaultValue={false}
    >
      <div>
        <h2>New Dashboard</h2>
        <p>Welcome to the new dashboard!</p>
      </div>
    </FeatureFlag>
  );
}
```

### Example: Render only when the flag matches a value

```tsx
<FeatureFlag
  flagKey="loan-application-flow-v2"
  defaultValue={false}
  matchValue={true}
  fallback={<p>Feature unavailable</p>}
>
  <NewLoanApplication />
</FeatureFlag>
```

When the flag evaluates to `true`, the new application component is displayed. Otherwise, the fallback is rendered.

The component forwards supported props to the underlying OpenFeature React SDK component.

## 7. OpenFeature React Hooks

The SDK re-exports hooks from `@openfeature/react-sdk`, allowing microfrontends to access OpenFeature functionality through one package.

### Available hooks

| Hook | Purpose |
|---|---|
| `useFlag` | Evaluates a feature flag |
| `useBooleanFlagValue` | Retrieves a Boolean flag value |
| `useStringFlagValue` | Retrieves a String flag value |
| `useNumberFlagValue` | Retrieves a Number flag value |
| `useObjectFlagValue` | Retrieves an Object flag value |
| `useBooleanFlagDetails` | Retrieves Boolean evaluation details |
| `useStringFlagDetails` | Retrieves String evaluation details |
| `useNumberFlagDetails` | Retrieves Number evaluation details |
| `useObjectFlagDetails` | Retrieves Object evaluation details |
| `useTrack` | Tracks an application event |
| `useOpenFeatureClientStatus` | Retrieves OpenFeature client status |
| `useWhenProviderReady` | Waits for provider readiness |

### Example

```tsx
import {
  useBooleanFlagValue,
} from "@lendistry/openfeature";

function Dashboard() {
  const isDashboardEnabled = useBooleanFlagValue(
    "new-dashboard",
    false
  );

  if (!isDashboardEnabled) {
    return null;
  }

  return <h2>New Dashboard</h2>;
}
```

Use the appropriate hook based on the expected flag value type.

## 8. Direct API Evaluation: useFeatureFlagApi

The SDK provides `useFeatureFlagApi` for applications that need to retrieve an evaluated flag directly from the backend.

Unlike OpenFeature React hooks, this hook makes a backend API request.

### Example

```tsx
import {
  useFeatureFlagApi,
} from "@lendistry/openfeature";

function PortalConfiguration() {
  const {
    data,
    loading,
    error,
  } = useFeatureFlagApi({
    flagKey: "new-portal-config",
    defaultValue: false,
    context: {
      userAgent: navigator.userAgent,
      location: window.location.href,
    },
  });

  if (loading) {
    return <p>Loading configuration...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
```

API credentials and subject information are reused from the SDK initialization configuration.

### Hook parameters

| Parameter | Description |
|---|---|
| `flagKey` | Feature flag key to evaluate |
| `defaultValue` | Fallback value if evaluation cannot provide a value |
| `context` | Additional evaluation attributes |

### Hook return values

| Property | Description |
|---|---|
| `data` | Evaluated flag value |
| `loading` | Indicates whether the request is in progress |
| `error` | Error message if the request fails |

## 9. Evaluation Context

Evaluation context allows applications to provide additional information about the user or application during flag evaluation.

### Example

```tsx
setEvaluationContext({
  targetingKey: "user-123",
  role: "admin",
  application: "loan-portal",
});
```

Context can be used by the feature flag provider when evaluating flags.

The exact attributes supported for targeting depend on the backend feature flag configuration.

## 10. Lifecycle Hooks

The SDK provides lifecycle hook registration through OpenFeature.

Lifecycle hooks allow applications to execute custom logic during feature flag evaluation.

Supported lifecycle stages include:

| Lifecycle stage | Purpose |
|---|---|
| `before` | Executes before flag evaluation |
| `after` | Executes after successful evaluation |
| `error` | Executes when evaluation fails |
| `finally` | Executes after evaluation completes |

### Example

```tsx
import {
  addClientHooks,
} from "@lendistry/openfeature";

const featureFlagLifecycleHook = {
  before: async (context) => {
    console.log("Before feature evaluation", context);
  },

  after: async (context, details) => {
    console.log("Feature evaluation completed", details);
  },

  error: async (context, error) => {
    console.error("Feature evaluation failed", error);
  },

  finally: async (context, details) => {
    console.log("Feature evaluation finished");
  },
};

addClientHooks(featureFlagLifecycleHook);
```

Register lifecycle hooks after initialization and before the evaluations you want to observe.

The callback signatures and supported lifecycle stages follow the installed OpenFeature SDK version.

## 11. OpenFeature Utility Functions

The SDK exposes utility functions to manage the OpenFeature client and its configuration.

| Function | Description |
|---|---|
| `getFeatureFlagClient()` | Retrieves the initialized OpenFeature client |
| `setEvaluationContext(context)` | Sets the evaluation context |
| `addGlobalHooks(...hooks)` | Registers global OpenFeature hooks |
| `addClientHooks(...hooks)` | Registers hooks for the SDK client |
| `setFeatureFlagLogger(logger)` | Configures the OpenFeature logger |
| `shutdownFeatureFlags()` | Closes OpenFeature and releases resources |

### Example: Retrieve the client

```tsx
import {
  getFeatureFlagClient,
} from "@lendistry/openfeature";

const client = getFeatureFlagClient();
```

### Example: Register a logger

```tsx
import {
  setFeatureFlagLogger,
} from "@lendistry/openfeature";

setFeatureFlagLogger({
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
});
```

Use the logger type and methods supported by the installed OpenFeature SDK version.

## 12. Microfrontend Integration

The recommended architecture is to initialize the SDK in the host application and share the provider context with remote applications.

### Host application

The host application is responsible for:

1. Installing the SDK.
2. Initializing feature flags.
3. Registering the OpenFeature provider.
4. Wrapping the application tree with `FeatureFlagProvider`.
5. Loading remote applications inside the provider tree.

```tsx
import {
  initializeFeatureFlags,
  FeatureFlagProvider,
} from "@lendistry/openfeature";

async function bootstrap() {
  await initializeFeatureFlags({
    apiKey: "your-api-key",
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

### Host application composition

```tsx
function App() {
  return (
    <>
      <h1>Host Application</h1>

      <RemoteDashboard />

      <RemoteLoanApplication />
    </>
  );
}
```

### Remote application

Install the SDK in the remote application:

```bash
npm install @lendistry/openfeature
```

The remote application can consume the host's OpenFeature provider context.

```tsx
import {
  FeatureFlag,
} from "@lendistry/openfeature";

function RemoteDashboard() {
  return (
    <FeatureFlag
      flagKey="new-dashboard"
      defaultValue={false}
    >
      <h2>Remote Dashboard Feature</h2>
    </FeatureFlag>
  );
}

export default RemoteDashboard;
```

The remote application should not initialize the SDK again when it is consuming the host's shared provider context.

### Important microfrontend considerations

- Initialize the SDK once in the host application.
- Render remote applications inside the host's `FeatureFlagProvider`.
- Share compatible React and React DOM instances.
- Share the SDK and OpenFeature React SDK instances through Module Federation.
- Avoid separate React roots if the remote application needs to consume the host's React context.
- If a remote application runs independently, it needs its own initialization and provider setup.

## 13. Module Federation Configuration

Configure the host and remote applications to share compatible dependency instances.

### Host configuration

```js
new ModuleFederationPlugin({
  name: "host",

  remotes: {
    dashboard:
      "dashboard@http://localhost:3001/remoteEntry.js",
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

### Remote configuration

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

The exact configuration may vary depending on the Module Federation version and build tooling.

## 14. Backend API Integration

The SDK communicates with the Lendistry backend using the following operations:

| Operation | Endpoint | Purpose |
|---|---|---|
| Evaluate all flags | `POST /v1/flags/evaluate-all` | Retrieves evaluated feature flag values |
| Evaluate individual flag | `POST /v1/flags/{flagKey}/evaluate` | Retrieves an individual flag value |

### Authentication

The API key is sent through the request header:

```http
X-API-Key: <API_KEY>
```

### Request payload

```json
{
  "subjectId": "user-123",
  "defaultValue": false,
  "context": {
    "role": "admin"
  }
}
```

The exact response structure depends on the backend API contract.

**Security note:** Browser-based API keys are visible to users through browser developer tools. Do not expose confidential server-side credentials in frontend applications.

## 15. Error Handling

Initialization errors should be handled by the host application.

```tsx
async function bootstrap() {
  try {
    await initializeFeatureFlags({
      apiKey: "your-api-key",
      subjectId: "user-123",
    });

    root.render(
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    );
  } catch (error) {
    console.error(
      "Feature flag initialization failed:",
      error
    );
  }
}

bootstrap();
```

For direct API evaluation, use the `loading` and `error` properties returned by `useFeatureFlagApi`.

## 16. Building the SDK

From the SDK directory:

```bash
cd src/sdk
npm install
npm run build
```

The build generates JavaScript bundles and TypeScript declaration files in the `dist` directory.

Expected output:

```text
dist/
├── index.js
├── index.cjs
├── index.d.ts
└── index.d.cts
```

## 17. Publishing the SDK

Before publishing:

1. Verify the SDK build succeeds.
2. Verify the package name and version in `src/sdk/package.json`.
3. Verify the internal npm registry configuration.
4. Verify the generated `dist` files.
5. Verify the README and package exports.
6. Publish using the approved internal release process.

Example:

```bash
cd src/sdk

npm run build

npm publish
```

Publishing requires the appropriate registry permissions and authentication.

## 18. Public SDK Exports

The SDK provides the following public exports.

### Initialization

- `initializeFeatureFlags`
- `DEFAULT_DOMAIN`

### Components

- `FeatureFlag`
- `FeatureFlagProvider`

### Hooks

- `useFeatureFlagApi`
- `useFlag`
- `useBooleanFlagValue`
- `useStringFlagValue`
- `useNumberFlagValue`
- `useObjectFlagValue`
- `useBooleanFlagDetails`
- `useStringFlagDetails`
- `useNumberFlagDetails`
- `useObjectFlagDetails`
- `useTrack`
- `useOpenFeatureClientStatus`
- `useWhenProviderReady`

### Utilities

- `getFeatureFlagClient`
- `setEvaluationContext`
- `addGlobalHooks`
- `addClientHooks`
- `setFeatureFlagLogger`
- `shutdownFeatureFlags`

### Types

- `FeatureFlagOptions`
- `FeatureFlagProps`

---

## Support

For SDK integration issues, contact the team responsible for maintaining the Lendistry OpenFeature SDK.
