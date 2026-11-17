import type { JsonValue } from "@openfeature/react-sdk";

export interface FeatureFlagApiOptions {
  apiKey: string;
  environment: string;
  subjectId: string;
  baseUrl?: string;
  attributes?: Record<string, JsonValue>;
  fetcher?: typeof fetch;
}

export interface EvaluateAllResponse {
  values: Record<string, JsonValue>;
}

export interface EvaluateOneResponse {
  value: JsonValue;
}

export class FeatureFlagApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "FeatureFlagApiError";
  }
}

export function createEvaluationUrl(
  baseUrl: string,
  flagKey?: string,
): URL {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const endpoint = flagKey
    ? `v1/flags/${encodeURIComponent(flagKey)}/evaluate`
    : "v1/flags/evaluate-all";

  try {
    return new URL(endpoint, normalizedBaseUrl);
  } catch {
    throw new FeatureFlagApiError(
      `Invalid feature flag API base URL: ${baseUrl}`,
    );
  }
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEvaluationResponse(
  value: unknown,
  flagKey?: string,
): EvaluateAllResponse | EvaluateOneResponse {
  if (!isRecord(value)) {
    throw new FeatureFlagApiError("Feature flag API returned an invalid response.");
  }

  if (flagKey !== undefined) {
    if (!("value" in value) || !isJsonValue(value.value)) {
      throw new FeatureFlagApiError(
        "Feature flag API response must contain a JSON value.",
      );
    }
    return { value: value.value };
  }

  if (!isRecord(value.values)) {
    throw new FeatureFlagApiError(
      "Feature flag API response must contain a values object.",
    );
  }

  const entries = Object.entries(value.values);
  if (!entries.every(([, flagValue]) => isJsonValue(flagValue))) {
    throw new FeatureFlagApiError(
      "Feature flag API returned a non-JSON flag value.",
    );
  }

  return { values: value.values as Record<string, JsonValue> };
}

export async function evaluateFlags(
  options: FeatureFlagApiOptions,
  flagKey?: string,
  signal?: AbortSignal,
): Promise<EvaluateAllResponse | EvaluateOneResponse> {
  if (!options.apiKey.trim()) {
    throw new FeatureFlagApiError("An API key is required.");
  }
  if (!options.environment.trim()) {
    throw new FeatureFlagApiError("An environment is required.");
  }
  if (!options.subjectId.trim()) {
    throw new FeatureFlagApiError("A subject ID is required.");
  }

  const baseUrl = options.baseUrl ?? "http://localhost:9099";
  const fetcher = options.fetcher ?? globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new FeatureFlagApiError("The current runtime does not provide fetch.");
  }

  let response: Response;
  try {
    response = await fetcher(createEvaluationUrl(baseUrl, flagKey), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": options.apiKey,
      },
      body: JSON.stringify({
        subjectId: options.subjectId,
        environment: options.environment,
        attributes: options.attributes ?? {},
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new FeatureFlagApiError(`Unable to reach the feature flag API: ${message}`);
  }

  if (!response.ok) {
    throw new FeatureFlagApiError(
      `Feature flag API request failed with status ${response.status}.`,
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new FeatureFlagApiError("Feature flag API returned invalid JSON.");
  }

  return parseEvaluationResponse(payload, flagKey);
}
