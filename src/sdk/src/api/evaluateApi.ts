export interface FeatureFlagApiOptions {
  apiKey: string;
  environment: string;
  subjectId: string;
}

interface EvaluateAllResponse {
  values: Record<string, unknown>;
}

interface EvaluateFlagResponse {
  value: unknown;
}

const BASE_URL = "http://localhost:9099";

// Common API request
async function apiRequest<T>(
  endpoint: string,
  options: FeatureFlagApiOptions,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": options.apiKey,
    },
    body: JSON.stringify({
      subjectId: options.subjectId,
      environment: options.environment,
      attributes: {},
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Feature flag API error: ${response.status}`);
  }

  return response.json();
}

// Evaluate all feature flags
export async function evaluateAllFlags(
  options: FeatureFlagApiOptions
): Promise<Record<string, unknown>> {
  const response = await apiRequest<EvaluateAllResponse>(
    "/v1/flags/evaluate-all",
    options
  );

  return response.values;
}

// Evaluate an individual feature flag
export async function evaluateFlag(
  flagKey: string,
  options: FeatureFlagApiOptions,
  signal?: AbortSignal
): Promise<unknown> {
  const response = await apiRequest<EvaluateFlagResponse>(
    `/v1/flags/${encodeURIComponent(flagKey)}/evaluate`,
    options,
    signal
  );

  return response.value;
}