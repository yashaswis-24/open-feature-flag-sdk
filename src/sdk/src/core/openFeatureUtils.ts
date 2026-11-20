import { OpenFeature } from "@openfeature/react-sdk";

import type {
  EvaluationContext,
  Hook,
  Logger,
} from "@openfeature/react-sdk";

import { DEFAULT_DOMAIN } from "./initialize";

// Gets the OpenFeature client to perform flag evaluations directly.
export function getFeatureFlagClient() {
  return OpenFeature.getClient(DEFAULT_DOMAIN);
}

// Sets contextual information used when evaluating flags.
export function setEvaluationContext(
  context: EvaluationContext
) {
  return OpenFeature.setContext(
    DEFAULT_DOMAIN,
    context
  );
}

// Registers hooks at the OpenFeature API/provider lifecycle level.
export function addGlobalHooks(...hooks: Hook[]) {
  OpenFeature.addHooks(...hooks);
}

// Registers hooks for client-level evaluation events.
export function addClientHooks(...hooks: Hook[]) {
  getFeatureFlagClient().addHooks(...hooks);
}

// Configures logging for feature flag operations.
export function setFeatureFlagLogger(logger: Logger) {
  OpenFeature.setLogger(logger);
}

// Cleans up feature flag resources when the application shuts down.
export async function shutdownFeatureFlags() {
  await OpenFeature.close();
}