import { useMemo, useEffect, useCallback } from "react";
import { bidirectional } from "../bi-directional-generator";

export function useBidirectional<T>(source: Generator<T, void, unknown>) {
  const bidirectionalSource = useMemo(() => bidirectional(source), [source]);

  useEffect(() => {
    return () => {
      bidirectionalSource.return?.();
    }
  }, [bidirectionalSource]);

  return {
    next: useCallback(() => bidirectionalSource.next(), [bidirectionalSource]),
    previous: useCallback(() => bidirectionalSource.previous(), [bidirectionalSource]),
    throw: useCallback((error: unknown) => bidirectionalSource.throw?.(error), [bidirectionalSource]),
    return: useCallback(() => bidirectionalSource.return?.(), [bidirectionalSource]),
  }
}
