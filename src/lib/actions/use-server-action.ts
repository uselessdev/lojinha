"use client";

import { useCallback, useState } from "react";
import { Result } from "./create-server-action";

type Action<A, T> = (data: A) => Promise<Result<T>>;

export function useServerAction<A, T>(action: Action<A, T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[] | null>(null);

  const mutate = useCallback(
    (
      data: A,
      callback?: {
        onSuccess?: (data?: T) => void;
        onError?: (error: string | string[]) => void;
      },
    ) => {
      (async () => {
        setError(null);
        setLoading(true);

        const result = await action(data);

        if (result.success) {
          setLoading(false);
        }

        if (result.success && callback?.onSuccess) {
          callback.onSuccess(result.data);
        }

        if (!result.success) {
          setError(result.error);
          setLoading(false);
        }

        if (!result.success && callback?.onError) {
          callback.onError(result.error);
        }
      })();
    },
    [action],
  );

  return {
    mutate,
    error,
    status: loading ? "loading" : "idle",
    isLoading: loading,
    isError: Boolean(error),
  };
}
