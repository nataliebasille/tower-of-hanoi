type BidirectionalGenerator<T> =
  Generator<T, void, unknown> & {
    previous(): IteratorResult<T>;
  };

export function bidirectional<T>(
  source: Generator<T, void, unknown>,
): BidirectionalGenerator<T> {
  const history: T[] = [];
  let index = -1;

  const next = (): IteratorResult<T> => {
    if (index + 1 < history.length) {
      return {
        value: history[++index],
        done: false,
      };
    }

    const result = source.next();

    if (!result.done) {
      history.push(result.value);
      index++;
    }

    return result;
  };

  const generator = (function* () {
    while (true) {
      const result = next();

      if (result.done) {
        return;
      }

      yield result.value;
    }
  })();

  return Object.assign(generator, {
    next,

    previous(): IteratorResult<T> {
      if (index <= 0) {
        return {
          value: undefined,
          done: true,
        };
      }

      return {
        value: history[--index],
        done: false,
      };
    },

    return(): IteratorResult<T, void> {
      return source.return();
    },

    throw(error: unknown): IteratorResult<T, void> {
      return source.throw(error);
    },
  });
}