import { after, afterEach } from "node:test";
import { JSDOM } from "jsdom";
import {
  act,
  createElement,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import { createRoot } from "react-dom/client";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = {
  window: dom.window,
  document: dom.window.document,
  IS_REACT_ACT_ENVIRONMENT: true,
};
const originalGlobals = Object.getOwnPropertyDescriptors(globalThis);
const unmounts: Array<() => void> = [];

for (const [key, value] of Object.entries(globals)) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}

afterEach(() => {
  for (const unmount of unmounts.splice(0)) unmount();
});

after(() => {
  dom.window.close();
  for (const key of Object.keys(globals)) {
    const original = originalGlobals[key];
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  }
});

export function renderHookControls<T>(useHook: () => T): T {
  return renderHook(useHook, undefined).current;
}

export function renderHook<P, T>(
  useHook: (props: P) => T,
  initialProps: NoInfer<P>,
  Wrapper?: ComponentType<PropsWithChildren>,
) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let current: T;
  let mounted = true;

  function Harness({ hookProps }: { hookProps: P }) {
    current = useHook(hookProps);
    return null;
  }

  function rerender(props: P) {
    const harness = createElement(Harness, { hookProps: props });
    act(() =>
      root.render(Wrapper ? createElement(Wrapper, null, harness) : harness),
    );
  }

  function unmount() {
    if (!mounted) return;
    act(() => root.unmount());
    container.remove();
    mounted = false;
  }

  unmounts.push(unmount);
  rerender(initialProps);

  return {
    get current() {
      return current;
    },
    rerender,
    unmount,
  };
}

export function* values<T>(...items: T[]): Generator<T, void, unknown> {
  for (const item of items) yield item;
}
