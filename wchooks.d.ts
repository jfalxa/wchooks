/**
 * @typedef {{
 *  Element?: typeof HTMLElement,
 *  observedAttributes?: string[],
 *  attachRoot?: (element: HTMLElement) => ParentNode
 * }} HookedOptions
 */
/**
 * @template T
 * @param {() => T} renderer
 * @param {(template: T, root: ParentNode) => void} render
 * @param {HookedOptions=} options
 * @returns {CustomElementConstructor}
 */
export function Hooked<T>(renderer: () => T, render: (template: T, root: ParentNode) => void, options?: HookedOptions | undefined): CustomElementConstructor;
/**
 * @template T
 * @param {T} initialValue
 * @returns {{ value: T }}
 */
export function useRef<T>(initialValue: T): {
    value: T;
};
/**
 * @template T
 * @template {any[]} D
 * @param {(...deps: D) => T} createValue
 * @param {D} deps
 * @param {IsEqual<D>} isEqual
 * @returns {T}
 */
export function useMemoize<T, D extends any[]>(createValue: (...deps: D) => T, deps: D, isEqual?: typeof isShallowEqual): T;
/**
 * @template A
 * @typedef {(action: A) => void} Dispatch
 */
/**
 * @template T
 * @template A
 * @typedef {(dispatch: Dispatch<A>, getState: () => T) => T} StateInit
 */
/**
 * @template T
 * @template A
 * @param {T | StateInit<T, A>} initialState
 * @param {(state: T, action: A) => void} reducer
 * @returns {[T, Dispatch<A>]}
 */
export function useReducer<T, A>(initialState: T | StateInit<T, A>, reducer: (state: T, action: A) => void): [T, Dispatch<A>];
/**
 * @template T
 * @typedef {T | ((value: T) => T)} SetState
 */
/**
 * @template T
 * @param {T | (() => T)} createState
 * @returns {[T, Dispatch<SetState<T>>]}
 */
export function useState<T>(createState: T | (() => T)): [T, Dispatch<SetState<T>>];
/**
 * @template T
 * @param {T | StateInit<T, SetState<Partial<T>>>} createStore
 * @returns {[T, Dispatch<SetState<Partial<T>>>]}
 */
export function useStore<T>(createStore: T | StateInit<T, SetState<Partial<T>>>): [T, Dispatch<SetState<Partial<T>>>];
/**
 * @typedef {(...args: any[]) => Promise<any>} AsyncFn
 */
/**
 * @template {AsyncFn} F
 * @typedef {F extends (...args: any[]) => Promise<infer T> ? T : never} PromiseType
 */
/**
 * @template {AsyncFn} F
 * @typedef  {{
 *  loading: boolean,
 *  value: PromiseType<F> | undefined,
 *  error: Error | undefined,
 *  cancel: () => void,
 *  call: F
 * }} Async
 */
/**
 * @template {AsyncFn} F
 * @param {F} asyncFn
 * @returns {Async<F>}
 */
export function useAsync<F extends AsyncFn>(asyncFn: F): Async<F>;
/**
 * @template {{ [name: string]: any }} A
 * @typedef {{ [name in keyof A]: A[name] }} Attributes
 */
/**
 * @template {{ [name: string]: any }} A
 * @param {Attributes<A>} attributes
 * @returns {[Attributes<A>, (values: Partial<Attributes<A>>) => void]}
 */
export function useAttributes<A extends {
    [name: string]: any;
}>(attributes: Attributes<A>): [Attributes<A>, (values: Partial<Attributes<A>>) => void];
/**
 * @template {{ [name: string]: any }} P
 * @typedef {{ [name in keyof P]: P[name] }} Properties
 */
/**
 * @template {{ [name: string]: any }} P
 * @param {Properties<P>} properties
 * @returns {[Properties<P>, (values: Partial<Properties<P>>) => void]}
 */
export function useProperties<P extends {
    [name: string]: any;
}>(properties: Properties<P>): [Properties<P>, (values: Partial<Properties<P>>) => void];
/**
 * @template T
 * @typedef {(options?: CustomEventInit<T>) => CustomEvent<T>} DispatchEvent
 */
/**
 * @template T
 * @param {string} event
 * @param {CustomEventInit<T>=} options
 * @returns {DispatchEvent<T>}
 */
export function useEvent<T>(event: string, options?: CustomEventInit<T>): DispatchEvent<T>;
/**
 * @template {any[]} D
 * @typedef {(element: HTMLElement, ...deps: D) => void} LifeCycleCallback
 */
/**
 * @template {any[]} D
 * @param {LifeCycleCallback<D>} updatedCallback
 * @param {D=} deps
 * @param {IsEqual<D>=} isEqual
 * @returns {void}
 */
export function onUpdated<D extends any[]>(updatedCallback: LifeCycleCallback<D>, deps?: D, isEqual?: typeof isShallowEqual): void;
/**
 * @template {any[]} D
 * @param {LifeCycleCallback<D>} renderedCallback
 * @param {D=} deps
 * @param {IsEqual<D>=} isEqual
 * @returns {void}
 */
export function onRendered<D extends any[]>(renderedCallback: LifeCycleCallback<D>, deps?: D, isEqual?: typeof isShallowEqual): void;
export type HookedOptions = {
    Element?: typeof HTMLElement;
    observedAttributes?: string[];
    attachRoot?: (element: HTMLElement) => ParentNode;
};
export type Dispatch<A> = (action: A) => void;
export type StateInit<T, A> = (dispatch: Dispatch<A>, getState: () => T) => T;
export type SetState<T> = T | ((value: T) => T);
export type AsyncFn = (...args: any[]) => Promise<any>;
export type PromiseType<F extends AsyncFn> = F extends (...args: any[]) => Promise<infer T> ? T : never;
export type Async<F extends AsyncFn> = {
    loading: boolean;
    value: PromiseType<F> | undefined;
    error: Error | undefined;
    cancel: () => void;
    call: F;
};
export type Attributes<A extends {
    [name: string]: any;
}> = { [name in keyof A]: A[name]; };
export type Properties<P extends {
    [name: string]: any;
}> = { [name in keyof P]: P[name]; };
export type DispatchEvent<T> = (options?: CustomEventInit<T>) => CustomEvent<T>;
export type LifeCycleCallback<D extends any[]> = (element: HTMLElement, ...deps: D) => void;
export type IsEqual<D extends any[]> = typeof isShallowEqual;
/**
 * @template {any[]} D
 * @typedef {typeof isShallowEqual} IsEqual
 */
/**
 * @template {any[]} D
 * @param {D=} deps
 * @param {D=} oldDeps
 * @returns {boolean}
 */
declare function isShallowEqual<D extends any[]>(deps?: D, oldDeps?: D): boolean;
export {};
