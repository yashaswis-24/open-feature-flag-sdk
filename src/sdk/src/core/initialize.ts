
import {
  OpenFeature,
  TypedInMemoryProvider,
} from "@openfeature/react-sdk";

import type { JsonValue } from "@openfeature/react-sdk";
import type { FeatureFlagApiOptions } from "../api/evaluateApi";

import { evaluateAllFlags } from "../api/evaluateApi";

export const DEFAULT_DOMAIN = "open-feature-flags";

export interface FeatureFlagOptions extends FeatureFlagApiOptions {
  apiKey: string;
  subjectId: string;
}

type FlagConfig = Record<
  string,
  {
    variants: Record<string, JsonValue>;
    defaultVariant: string;
    disabled: boolean;
  }
>;

type InitializedOptions = Pick<
  FeatureFlagOptions,
  "apiKey" | "subjectId"
>;

// Shared browser-level storage.
// This allows separate SDK module instances to access the same options.
type SharedFeatureFlagState = typeof globalThis & {
  __LENDISTRY_OPENFEATURE_API_OPTIONS__?: InitializedOptions;
};

const sharedState = globalThis as SharedFeatureFlagState;

export function getInitializedApiOptions(): InitializedOptions {
  const options = sharedState.__LENDISTRY_OPENFEATURE_API_OPTIONS__;

  if (!options) {
    throw new Error(
      "Feature flags are not initialized. Call initializeFeatureFlags first."
    );
  }

  return options;
}

export async function initializeFeatureFlags(
  options: FeatureFlagOptions
) {
  try {
    // Fetch all feature flags from backend
    const values = await evaluateAllFlags(options);

    // Convert API response into OpenFeature configuration
    const flagConfiguration: FlagConfig = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        {
          variants: {
            default: value as JsonValue,
          },
          defaultVariant: "default",
          disabled: false,
        },
      ])
    );

    // Create OpenFeature in-memory provider
    const provider = new TypedInMemoryProvider(flagConfiguration);

    // Register provider with OpenFeature
    await OpenFeature.setProviderAndWait(
      DEFAULT_DOMAIN,
      provider
    );

    // Save options in shared browser storage
    sharedState.__LENDISTRY_OPENFEATURE_API_OPTIONS__ = {
      apiKey: options.apiKey,
      subjectId: options.subjectId,
    };

    console.log("Feature flags initialized successfully", sharedState.__LENDISTRY_OPENFEATURE_API_OPTIONS__);

    return OpenFeature.getClient(DEFAULT_DOMAIN);
  } catch (error) {
    console.error("Failed to initialize feature flags:", error);
    throw error;
  }
}
