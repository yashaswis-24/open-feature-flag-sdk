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

export async function initializeFeatureFlags(
  options: FeatureFlagOptions
) {
  try {
    // Fetch all feature flags from Lendistry backend
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
    const provider = new TypedInMemoryProvider(
      flagConfiguration
    );

    // Register provider with OpenFeature
    await OpenFeature.setProviderAndWait(
      DEFAULT_DOMAIN,
      provider
    );

    // Return initialized OpenFeature client
    return OpenFeature.getClient(DEFAULT_DOMAIN);

  } catch (error) {
    console.error(
      "Failed to initialize feature flags:",
      error
    );

    throw error;
  }
}
