"use client";

export type StoreListener = () => void;

export type StateUpdater<State> = State | ((previous: State) => State);

export type StoreApi<State> = {
  /**
   * Current state.
   *
   * Does not subscribe to changes.
   */
  getState(): State;

  /**
   * State that the store was created with.
   *
   * Primarily useful for SSR/hydration.
   */
  getInitialState(): State;

  /**
   * Replace the current state.
   *
   * Can receive either the next state or an updater function.
   */
  setState(update: StateUpdater<State>): State;

  /**
   * Subscribe to any store update.
   */
  subscribe(listener: StoreListener): () => void;
};

export type Selector<State, Selected> = (state: State) => Selected;

export function createStore<State>(initialState: State): StoreApi<State> {
  let state = initialState;

  const listeners = new Set<StoreListener>();

  const getState = () => state;

  const getInitialState = () => initialState;

  const setState = (update: StateUpdater<State>) => {
    const nextState =
      typeof update === "function" ?
        (update as (previous: State) => State)(state)
      : update;

    if (Object.is(state, nextState)) {
      return state;
    }

    state = nextState;

    listeners.forEach((listener) => {
      listener();
    });
    return state;
  };

  const subscribe = (listener: StoreListener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    getInitialState,
    setState,
    subscribe,
  };
}
