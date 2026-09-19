import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import { renderHook, renderHookControls, values } from "./test-helpers";
import { useGenerator } from "./useGenerator";

describe("useGenerator controls", () => {
  it("keeps callbacks and source position across rerenders with the same source", () => {
    const source = values(10, 20);
    const hook = renderHook(useGenerator<number>, source);
    const initial = hook.current;
    initial.next();

    hook.rerender(source);

    strictEqual(hook.current.next, initial.next);
    strictEqual(hook.current.throw, initial.throw);
    strictEqual(hook.current.return, initial.return);
    deepStrictEqual(hook.current.next(), { value: 20, done: false });
  });

  it("closes the old source on replacement and directs controls to the new source", () => {
    let cleanedUp = false;
    const source = (function* () {
      try {
        yield 10;
        yield 20;
      } finally {
        cleanedUp = true;
      }
    })();
    const hook = renderHook(useGenerator<number>, source);
    hook.current.next();

    hook.rerender(values(30, 40));

    strictEqual(cleanedUp, true);
    deepStrictEqual(source.next(), { value: undefined, done: true });
    deepStrictEqual(hook.current.next(), { value: 30, done: false });
    deepStrictEqual(hook.current.next(), { value: 40, done: false });
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
    const hook = renderHook(useGenerator<number>, source);
    hook.current.next();

    hook.unmount();

    strictEqual(cleanupCount, 1);
    deepStrictEqual(source.next(), { value: undefined, done: true });
  });

  it("does not advance the source during render", () => {
    let started = false;
    const source = (function* () {
      started = true;
      yield 10;
    })();

    const controls = renderHookControls(() => useGenerator(source));

    strictEqual(started, false);
    deepStrictEqual(controls.next(), { value: 10, done: false });
    strictEqual(started, true);
  });

  it("advances through the source and reports completion", () => {
    const source = values(10, 20);
    const controls = renderHookControls(() => useGenerator(source));

    deepStrictEqual(controls.next(), { value: 10, done: false });
    deepStrictEqual(controls.next(), { value: 20, done: false });
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("reports completion for an empty source", () => {
    const source = values();
    const controls = renderHookControls(() => useGenerator(source));

    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("return closes the source and runs its cleanup", () => {
    let cleanedUp = false;
    const source = (function* () {
      try {
        yield 10;
        yield 20;
      } finally {
        cleanedUp = true;
      }
    })();
    const controls = renderHookControls(() => useGenerator(source));
    controls.next();

    deepStrictEqual(controls.return(), { value: undefined, done: true });
    strictEqual(cleanedUp, true);
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("passes thrown errors to the source and returns its recovery value", () => {
    const error = new Error("Recoverable failure");
    let received: unknown;
    const source = (function* () {
      try {
        yield 10;
      } catch (caught) {
        received = caught;
        yield 20;
      }
    })();
    const controls = renderHookControls(() => useGenerator(source));
    controls.next();

    deepStrictEqual(controls.throw(error), { value: 20, done: false });
    strictEqual(received, error);
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });

  it("propagates errors that the source does not handle", () => {
    const error = new Error("Unhandled failure");
    const source = values(10, 20);
    const controls = renderHookControls(() => useGenerator(source));
    controls.next();

    throws(
      () => controls.throw(error),
      (actual) => actual === error,
    );
    deepStrictEqual(controls.next(), { value: undefined, done: true });
  });
});
