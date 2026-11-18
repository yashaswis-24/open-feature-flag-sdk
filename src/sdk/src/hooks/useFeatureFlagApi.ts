import { useEffect, useState } from "react";

import {
  evaluateFlag,
  evaluateAllFlags,
  type FeatureFlagApiOptions,
} from "../api/evaluateApi";

interface FeatureFlagApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFeatureFlagApiOptions extends FeatureFlagApiOptions {
  flagKey?: string;
}

export function useFeatureFlagApi<T = unknown>({
  apiKey,
  environment,
  subjectId,
  flagKey,
}: UseFeatureFlagApiOptions): FeatureFlagApiResult<T> {
  const [data, setData] = useState<T | null>(null);
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
          environment,
          subjectId,
        };

        const result = flagKey
          ? await evaluateFlag(flagKey, options, controller.signal)
          : await evaluateAllFlags(options, controller.signal);

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
  }, [apiKey, environment, subjectId, flagKey]);

  return { data, loading, error };
}