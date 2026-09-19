import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import { renderHook, renderHookControls, values } from "./test-helpers";
import { useBidirectional } from "./useBidirectional";

describe("useBidirectional controls", () => {
  it("preserves callbacks, history, and position across rerenders with the same source", () => {
    const source = values(10, 20, 30);
    const hook = renderHook(useBidirectional<number>, source);
    const initial = hook.current;
    initial.next();
    initial.next();

    hook.rerender(source);

    strictEqual(hook.current.next, initial.next);
    strictEqual(hook.current.previous, initial.previous);
    strictEqual(hook.current.throw, initial.throw);
    strictEqual(hook.current.return, initial.return);
    deepStrictEqual(hook.current.previous(), { value: 10, done: false });
    deepStrictEqual(hook.current.next(), { value: 20, done: false });
    deepStrictEqual(hook.current.next(), { value: 30, done: false });
  });

  it("starts fresh history when the source changes", () => {
    const source = values(10, 20);
    const hook = renderHook(useBidirectional<number>, source);
    hook.current.next();
    hook.current.next();

    hook.rerender(values(30, 40));

    deepStrictEqual(hook.current.previous(), { value: undefined, done: true });
    deepStrictEqual(hook.current.next(), { value: 30, done: false });
    deepStrictEqual(hook.current.previous(), { value: undefined, done: true });
    deepStrictEqual(hook.current.next(), { value: 40, done: false });
    deepStrictEqual(hook.current.previous(), { value: 30, done: false });
  });

  it("cleans up the old source when the source changes", () => {
    let cleanedUp = false;
    const source = (function* () {
      try {
        yield 10;
        yield 20;
      } finally {
        cleanedUp = true;
      }
    })();
    const hook = renderHook(useBidirectional<number>, source);
    hook.current.next();

    hook.rerender(values(30));

    strictEqual(cleanedUp, true);
    deepStrictEqual(source.next(), { value: undefined, done: true });
  });

  it("runs source cleanup on unmount", () => {
    let cleanupCount = 0;
    const source = (function* () {
      try {
        yield 10;
        yield 20;
      } finally {
        cleanupCount++;
      }
    })();
    const hook = renderHook(useBidirectional<number>, source);
    hook.current.next();

    hook.unmount();

    strictEqual(cleanupCount, 1);
    deepStrictEqual(source.next(), { value: undefined, done: true });
  });

  it("does not consume the source during render or before the first next", () => {
    let started = false;
    const source = (function* () {
      started = true;
      yield 10;
    })();
    const controls = renderHookControls(() => useBidirectional(source));

    strictEqual(started, false);
    deepStrictEqual(controls.previous(), { value: undefined, done: true });
    strictEqual(started, false);
    deepStrictEqual(controls.next(), { value: 10, done: false });
    strictEqual(started, true);
  });

  it("navigates history before continuing to new source values", () => {
    const source = values(10, 20, 30);
    const controls = renderHookControls(() => useBidirectional(source));

    deepStrictEqual(controls.next(), { value: 10, done: false });
    deepStrictEqual(controls.next(), { value: 20, done: false });
    deepStrictEqual(controls.previous(), { value: 10, done: false });
    deepStrictEqual(controls.previous(), { value: undefined, done: true });
    deepStrictEqual(controls.next(), { value: 20, done: false });
    deepStrictEqual(controls.next(), { value: 30, done: false });
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("handles an empty source in both directions", () => {
    const source = values();
    const controls = renderHookControls(() => useBidirectional(source));

    deepStrictEqual(controls.next(), { value: undefined, done: true });
    deepStrictEqual(controls.previous(), { value: undefined, done: true });
  });

  it("return stops forward iteration", () => {
    const source = values(10, 20);
    const controls = renderHookControls(() => useBidirectional(source));
    controls.next();

    deepStrictEqual(controls.return(), { value: undefined, done: true });
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("return runs the underlying source cleanup", () => {
    let cleanedUp = false;
    const source = (function* () {
      try {
        yield 10;
        yield 20;
      } finally {
        cleanedUp = true;
      }
    })();
    const controls = renderHookControls(() => useBidirectional(source));
    controls.next();

    controls.return();

    // Closing the wrapper should release the source resources it owns.
    strictEqual(cleanedUp, true);
  });

  it("propagates an unhandled thrown error and stops forward iteration", () => {
    const error = new Error("Unhandled failure");
    const source = values(10, 20);
    const controls = renderHookControls(() => useBidirectional(source));
    controls.next();

    throws(
      () => controls.throw(error),
      (actual) => actual === error,
    );
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });
});
