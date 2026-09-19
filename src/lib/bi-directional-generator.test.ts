import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import { bidirectional } from "./bi-directional-generator";

describe("bidirectional", () => {
  it("yields source values in order and reports completion", () => {
    const iterator = bidirectional(values(10, 20, 30));

    deepStrictEqual(iterator.next(), { value: 10, done: false });
    deepStrictEqual(iterator.next(), { value: 20, done: false });
    deepStrictEqual(iterator.next(), { value: 30, done: false });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
  });

  it("handles an empty source in both directions", () => {
    const iterator = bidirectional(values());

    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
  });

  it("does not move before the first value when previous is unavailable", () => {
    const iterator = bidirectional(values(10, 20));

    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: 10, done: false });
    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: 20, done: false });
  });

  it("walks backward through history and resumes forward through new values", () => {
    const iterator = bidirectional(values(10, 20, 30, 40));
    iterator.next();
    iterator.next();
    iterator.next();

    deepStrictEqual(iterator.previous(), { value: 20, done: false });
    deepStrictEqual(iterator.previous(), { value: 10, done: false });
    deepStrictEqual(iterator.previous(), { value: undefined, done: true });
    deepStrictEqual(iterator.next(), { value: 20, done: false });
    deepStrictEqual(iterator.previous(), { value: 10, done: false });
    deepStrictEqual(iterator.next(), { value: 20, done: false });
    deepStrictEqual(iterator.next(), { value: 30, done: false });
    deepStrictEqual(iterator.next(), { value: 40, done: false });
  });

  it("evaluates the source lazily and does not repeat side effects during replay", () => {
    const produced: number[] = [];
    const iterator = bidirectional(
      (function* () {
        for (const value of [10, 20, 30]) {
          produced.push(value);
          yield value;
        }
      })(),
    );

    iterator.previous();
    deepStrictEqual(produced, []);
    iterator.next();
    deepStrictEqual(produced, [10]);
    iterator.next();
    deepStrictEqual(produced, [10, 20]);
    iterator.previous();
    iterator.next();
    deepStrictEqual(produced, [10, 20]);
    deepStrictEqual(iterator.next(), { value: 30, done: false });
    deepStrictEqual(produced, [10, 20, 30]);
  });

  it("preserves object identity when replaying cached values", () => {
    const first = { step: 0 };
    const second = { step: 1 };
    const iterator = bidirectional(values(first, second));

    strictEqual(iterator.next().value, first);
    strictEqual(iterator.next().value, second);
    strictEqual(iterator.previous().value, first);
    strictEqual(iterator.next().value, second);
  });

  it("treats undefined and other falsy values as yielded values", () => {
    const iterator = bidirectional(
      values<unknown>(undefined, null, false, 0, ""),
    );

    for (const value of [undefined, null, false, 0, ""]) {
      deepStrictEqual(iterator.next(), { value, done: false });
    }
    deepStrictEqual(iterator.previous(), { value: 0, done: false });
    deepStrictEqual(iterator.next(), { value: "", done: false });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
  });

  it("supports iteration over the remaining values after rewinding", () => {
    const iterator = bidirectional(values(10, 20, 30));
    strictEqual(iterator[Symbol.iterator](), iterator);
    iterator.next();
    iterator.next();
    iterator.previous();

    deepStrictEqual([...iterator], [20, 30]);
  });

  it("can replay forward after rewinding an exhausted source", () => {
    const iterator = bidirectional(values(10, 20, 30));
    deepStrictEqual([...iterator], [10, 20, 30]);

    // Exhaustion should still permit navigating the retained history.
    deepStrictEqual(iterator.previous(), { value: 20, done: false });
    deepStrictEqual(iterator.previous(), { value: 10, done: false });
    deepStrictEqual(iterator.next(), { value: 20, done: false });
    deepStrictEqual(iterator.next(), { value: 30, done: false });
    deepStrictEqual(iterator.next(), { value: undefined, done: true });
  });

  it("propagates source errors when advancing to a new value", () => {
    const error = new Error("Source failed");
    const iterator = bidirectional(
      (function* () {
        yield 10;
        throw error;
      })(),
    );

    deepStrictEqual(iterator.next(), { value: 10, done: false });
    throws(() => iterator.next(), (actual) => actual === error);
  });
});

function* values<T>(...items: T[]): Generator<T, void, unknown> {
  yield* items;
}
