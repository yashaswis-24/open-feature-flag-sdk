import { OpenFeature } from "@openfeature/react-sdk";

import type {
  EvaluationContext,
  Hook,
  Logger,
} from "@openfeature/react-sdk";

import { DEFAULT_DOMAIN } from "./initialize";

// Get OpenFeature client
export function getFeatureFlagClient() {
  return OpenFeature.getClient(DEFAULT_DOMAIN);
}

// Update evaluation context
export function setEvaluationContext(
  context: EvaluationContext
) {
  return OpenFeature.setContext(
    DEFAULT_DOMAIN,
    context
  );
}

// Register global hooks
export function addGlobalHooks(...hooks: Hook[]) {
  OpenFeature.addHooks(...hooks);
}

// Register client hooks
export function addClientHooks(...hooks: Hook[]) {
  getFeatureFlagClient().addHooks(...hooks);
}

// Configure global logger
export function setFeatureFlagLogger(logger: Logger) {
  OpenFeature.setLogger(logger);
}

// Shutdown OpenFeature
export async function shutdownFeatureFlags() {
  await OpenFeature.close();
}