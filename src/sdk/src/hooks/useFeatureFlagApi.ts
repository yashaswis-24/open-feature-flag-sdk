
import { useEffect, useState } from "react";

import {
  evaluateFlag,
  evaluateAllFlags,
  type FeatureFlagApiOptions,
} from "../api/evaluateApi";

// Supported feature flag types
export type FlagType =
  | "boolean"
  | "string"
  | "number"
  | "object";

// Flexible evaluation context
export type EvaluationContext = Record<
  string,
  unknown
>;

interface FeatureFlagApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFeatureFlagApiOptions<T>
  extends FeatureFlagApiOptions {
  flagKey: string;
  defaultValue: T;
  flagType: FlagType;
  context?: EvaluationContext;
}

export function useFeatureFlagApi<T>({
  apiKey,
  baseUrl,
  subjectId,
  flagKey,
  defaultValue,
  context = {},
}: UseFeatureFlagApiOptions<T>): FeatureFlagApiResult<T> {

  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFlags() {
      try {
        setLoading(true);
        setError(null);

        const options = {
          apiKey,
          baseUrl,
          subjectId,
          defaultValue,
          context,
        };

        const result = flagKey
          ? await evaluateFlag(
              flagKey,
              options,
              controller.signal
            )
          : await evaluateAllFlags(
              options,
              controller.signal
            );

        setData(result as T);

      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFlags();

    return () => controller.abort();

  }, [apiKey, subjectId, flagKey]);

  return {
    data,
    loading,
    error,
  };
}
