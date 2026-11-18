// Existing exports
export {
  initializeFeatureFlags,
  DEFAULT_DOMAIN,
} from "./core/initialize";

export {
  FeatureFlag,
} from "./components/FeatureFlag";

export {
  FeatureFlagProvider,
} from "./components/FeatureFlagProvider";

export {
  useFeatureFlagApi,
} from "./hooks/useFeatureFlagApi";

// New React hook wrappers
export * from "./hooks/openFeatureHooks";

// New OpenFeature utilities
export {
  getFeatureFlagClient,
  setEvaluationContext,
  addGlobalHooks,
  addClientHooks,
  setFeatureFlagLogger,
  shutdownFeatureFlags,
} from "./core/openFeatureUtils";

// Existing types
export type {
  FeatureFlagOptions,
} from "./core/initialize";

export type {
  FeatureFlagProps,
} from "./components/FeatureFlag";