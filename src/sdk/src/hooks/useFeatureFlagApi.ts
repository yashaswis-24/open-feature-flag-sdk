
import { useEffect, useState } from "react";

import { evaluateFlag } from "../api/evaluateApi";

import {
  getInitializedApiOptions,
} from "../core/initialize";

export type EvaluationContext = Record<
  string,
  unknown
>;

interface FeatureFlagApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFeatureFlagApiOptions<T> {
  flagKey: string;
  defaultValue: T;
  context?: EvaluationContext;
}

export function useFeatureFlagApi<T>({
  flagKey,
  defaultValue,
  context,
}: UseFeatureFlagApiOptions<T>): FeatureFlagApiResult<T> {

  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFlag() {
      try {
        setLoading(true);
        setError(null);

        const apiOptions = {
          ...getInitializedApiOptions(),
          defaultValue,
          context: context ?? {},
        };

        const result = await evaluateFlag(
          flagKey,
          apiOptions,
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

    fetchFlag();

    return () => controller.abort();

  }, [flagKey, defaultValue, context]);

  return {
    data,
    loading,
    error,
  };
}
