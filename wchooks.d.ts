export function Component(renderer: Renderer, options: ComponentOptions): CustomElementConstructor;

export interface Renderer {
  (): any;
}

export interface ComponentOptions {
  attachRoot?: (element: HTMLElement) => Element;
  Element?: typeof HTMLElement;
  observedAttributes?: string[];
  render: Function;
}

export interface Ref<T> {
  value: T;
}

export function useRef<T>(initialValue?: T): Ref<T>;

export function useConstant<T>(createConstant: T): T;

export function useMemoize<T>(createValue: () => T, deps: Deps): T;

export function useMemoizeFn<T>(fn: T, deps: Deps): T;

interface Reducer<T, A> {
  (state: T, action: A): T;
}

interface Dispatch<A> {
  (action: A): void;
}

export function useReducer<T, A>(initialState: T, reducer: Reducer<T, A>): [T, Dispatch<A>];

interface Setter<T> {
  (value: T): void;
  (value: (oldValue: T) => T): void;
}

export function useState<T>(initialState: T): [T, Setter<T>];

interface AttributeOptions<T> {
  get?: (attribute: string) => T;
  set?: (value: T) => string;
}

export function useAttribute<T>(attribute: string, options?: AttributeOptions<T>): [T, Setter<T>];

export function useProperty<T>(property: string, defaultValue?: T): [T, Setter<T>];

interface DispatchEvent {
  (options?: CustomEventInit): CustomEvent;
}

export function useEvent<K extends keyof HTMLElementEventMap>(
  name: K,
  options?: EventInit
): DispatchEvent;

export function useEvent<T>(name: string, options?: CustomEventInit<T>): DispatchEvent;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  name: K,
  listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => any,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
  name: string,
  listener: EventListenerOrEventListenerObject,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

interface LifeCycleHook {
  (callback: (element: HTMLElement) => Function | void): void;
}

export const onCreated: LifeCycleHook;
export const onConnected: LifeCycleHook;
export const onAdopted: LifeCycleHook;
export const onDisconnected: LifeCycleHook;

export function onAttributeChanged(
  callback: (
    element: HTMLElement,
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) => void
): void;

interface LifeCycleHookWithDeps {
  (callback: (element: HTMLElement) => void | (() => void), deps?: Deps): void;
}

export const onUpdated: LifeCycleHookWithDeps;
export const onRendered: LifeCycleHookWithDeps;

export type Deps = any[] | { deps: any; hasChanged: (deps: any, oldDeps: any) => boolean };
