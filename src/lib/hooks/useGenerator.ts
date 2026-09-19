import { useCallback, useEffect } from "react";

export function useGenerator<T>(source: Generator<T, void, unknown>) {
  useEffect(() => {
    return () => {
      source.return?.();
    }
  }, [source]);

  return {
    next: useCallback(() => source.next(), [source]),
    throw: useCallback((error: unknown) => source.throw?.(error), [source]),
    return: useCallback(() => source.return?.(), [source]),
  }
}