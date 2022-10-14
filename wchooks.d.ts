export function Component<T>(
  renderer: () => T,
  render: (templateResult: T, root: HTMLElement) => void,
  options?: ComponentOptions
): CustomElementConstructor;

export interface Renderer<T> {
  (): T;
}

export interface ComponentOptions {
  attachRoot?: (element: HTMLElement) => Element;
  Element?: typeof HTMLElement;
  observedAttributes?: string[];
}

export interface Ref<T> {
  value: T;
}

export function useRef<T>(initialValue?: T): Ref<T>;

export function useMemoize<T>(createValue: () => T, deps: Deps): T;

export interface Fn {
  (...args: any[]): any;
}

export function useMemoizeFn<F extends Fn>(fn: F, deps: Deps): F;

export interface Async<F extends Fn> {
  loading: boolean;
  value: PromiseType<ReturnType<F>> | undefined;
  error: Error | undefined;
  call: F;
}

export interface AsyncFn {
  (...args: any[]): Promise<any>;
}

export function useAsync<F extends AsyncFn>(asyncFn: F): Async<F>;

export interface Reducer<T, A> {
  (state: T, action: A): T;
}

export interface Dispatch<A> {
  (action: A): void;
}

export function useReducer<T, A>(initialState: T, reducer: Reducer<T, A>): [T, Dispatch<A>];

export interface Setter<T> {
  (value: T): void;
  (value: (oldValue: T) => T): void;
}

export function useState<T>(initialState: T): [T, Setter<T>];

export interface AttributeOptions<T> {
  get?: (attribute: string) => T;
  set?: (value: T) => string;
}

export function useAttribute<T>(attribute: string, options?: AttributeOptions<T>): [T, Setter<T>];

export function useProperty<T>(property: string, defaultValue?: T): [T, Setter<T>];

export interface DispatchEvent<T> {
  (options?: CustomEventInit<T>): CustomEvent;
}

export function useEvent<K extends keyof HTMLElementEventMap>(
  name: K,
  options?: EventInit
): DispatchEvent<undefined>;

export function useEvent<T>(name: string, options?: CustomEventInit<T>): DispatchEvent<T>;

export function useEventListener<E extends keyof HTMLElementEventMap>(
  name: E,
  listener: (this: HTMLElement, event: HTMLElementEventMap[E]) => any,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
  name: string,
  listener: EventListenerOrEventListenerObject,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

export interface LifeCycleCallback {
  (element: HTMLElement): void;
}

export function useStyle(css: string): void;

export function onCreated(createdCallback: LifeCycleCallback): void;
export function onConnected(coonectedCallback: LifeCycleCallback): void;
export function onAdopted(adoptedCallback: LifeCycleCallback): void;
export function onDisconnected(disconnectedCallback: LifeCycleCallback): void;

export function onAttributeChanged(
  callback: (
    element: HTMLElement,
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) => void
): void;

interface LifeCycleCallbackWithClear {
  (element: HTMLElement): void | (() => void);
}

export function onRendered(callback: LifeCycleCallbackWithClear, deps?: Deps): void;

type PromiseType<P> = P extends Promise<infer T> ? T : never;

interface DepsOptions {
  deps: any;
  hasChanged: (deps: any, oldDeps: any) => boolean;
}

type Deps = any[] | DepsOptions;
