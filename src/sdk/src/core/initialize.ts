import {
  OpenFeature,
  TypedInMemoryProvider,
} from "@openfeature/react-sdk";

import type { JsonValue } from "@openfeature/react-sdk";

import { evaluateAllFlags } from "../api/evaluateApi";

export const DEFAULT_DOMAIN = "open-feature-flags";

export interface FeatureFlagOptions {
  apiKey: string;
  environment: string;
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
  // Fetch all flags using common API service
  const values = await evaluateAllFlags(options);

  // Convert API response into provider configuration
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

  const provider = new TypedInMemoryProvider(flagConfiguration);

  // Register provider
  await OpenFeature.setProviderAndWait(
    DEFAULT_DOMAIN,
    provider
  );

  console.log("Registered feature flags:", values);

  return OpenFeature.getClient(DEFAULT_DOMAIN);
}