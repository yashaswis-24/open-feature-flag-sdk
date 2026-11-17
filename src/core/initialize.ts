import {
  OpenFeature,
  TypedInMemoryProvider,
} from "@openfeature/react-sdk";
import { evaluateFlags, type FeatureFlagApiOptions } from "./api";

export const DEFAULT_DOMAIN = "open-feature-flag-sdk";

export type FeatureFlagOptions = FeatureFlagApiOptions;

export async function initializeFeatureFlags(options: FeatureFlagOptions) {
  const result = await evaluateFlags(options);
  if (!("values" in result)) {
    throw new Error("Feature flag API did not return the full flag set.");
  }

  const configuration = Object.fromEntries(
    Object.entries(result.values).map(([key, value]) => [
      key,
      {
        variants: { configured: value },
        defaultVariant: "configured" as const,
        disabled: false,
      },
    ]),
  );

  await OpenFeature.setProviderAndWait(
    DEFAULT_DOMAIN,
    new TypedInMemoryProvider(configuration),
  );

  return OpenFeature.getClient(DEFAULT_DOMAIN);
}
