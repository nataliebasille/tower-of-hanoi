import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Selector, StoreApi, createStore } from "./store";

type EqualityFn<Value> = (previous: Value, next: Value) => boolean;

type StateGetter<State> = () => State;

type StateRecipe<State> = (get: StateGetter<State>) => State;

type StateAction<State, Args extends unknown[]> = (
  ...args: Args
) => StateRecipe<State>;

export function createStoreContext<State>(createInitialState: () => State) {
  const StoreContext = createContext<StoreApi<State> | null>(null);

  type ProviderProps = PropsWithChildren<{
    /**
     * Override the default initial state.
     *
     * Useful when initial state comes from the server.
     *
     * This is only read when the Provider is first created.
     */
    initialState?: State;
  }>;

  function Provider({ initialState, children }: ProviderProps) {
    const storeRef = useRef<StoreApi<State> | null>(null);

    if (storeRef.current === null) {
      storeRef.current = createStore(initialState ?? createInitialState());
    }

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStoreApi(): StoreApi<State> {
    const store = useContext(StoreContext);

    if (store === null) {
      throw new Error("Fast context hook used outside its Provider");
    }

    return store;
  }

  /**
   * Subscribe to the entire state.
   *
   * The component rerenders for every state change.
   */
  function useStore(): State {
    const store = useStoreApi();

    return useSyncExternalStore(
      store.subscribe,
      store.getState,
      store.getInitialState,
    );
  }

  /**
   * Subscribe to a selected portion of state.
   *
   * By default, the selected value is compared with Object.is.
   */
  function useSelector<Selected>(
    selector: (state: State) => Selected,
  ): Selected {
    const store = useStoreApi();

    const state = useSyncExternalStore(
      store.subscribe,
      store.getState,
      store.getInitialState,
    );

    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    return useMemo(() => selectorRef.current(state), [state]);
  }

  /**
   * Convenient access to setState without subscribing
   * to store changes.
   */
  function useSetState<Args extends unknown[]>(
    action: StateAction<State, Args>,
  ): (...args: Args) => State {
    const store = useStoreApi();

    const actionRef = useRef(action);
    actionRef.current = action;

    const callbackRef = useRef<(...args: Args) => State>(null!);

    if (!callbackRef.current) {
      callbackRef.current = (...args: Args) => {
        return store.setState((previous) => {
          const get = () => previous;

          return actionRef.current(...args)(get);
        });
      };
    }

    return callbackRef.current;
  }

  return {
    Provider,
    useStore,
    useSelector,
    useStoreApi,
    useSetState,
  } as const;
}
