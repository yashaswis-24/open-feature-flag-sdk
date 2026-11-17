import { useEffect, useState } from "react";
import {
  evaluateFlags,
  type EvaluateAllResponse,
  type EvaluateOneResponse,
  type FeatureFlagApiOptions,
} from "../core/api";

export interface UseFeatureFlagApiOptions extends FeatureFlagApiOptions {
  flagKey?: string;
}

export interface FeatureFlagApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFeatureFlagApi<T = EvaluateAllResponse | EvaluateOneResponse>(
  options: UseFeatureFlagApiOptions,
): FeatureFlagApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attributesJson = JSON.stringify(options.attributes ?? {});

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadFlags() {
      setLoading(true);
      setError(null);
      try {
        const result = await evaluateFlags(
          {
            ...options,
          },
          options.flagKey,
          controller.signal,
        );
        if (active) {
          setData(result as T);
        }
      } catch (reason) {
        if (active && !(reason instanceof Error && reason.name === "AbortError")) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Feature flag evaluation failed.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadFlags();
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    options.apiKey,
    options.environment,
    options.subjectId,
    options.baseUrl,
    options.flagKey,
    options.fetcher,
    attributesJson,
  ]);

  return { data, loading, error };
}
