/**
 * Options to customize the behavior of the `Hooked` factory
 *
 * @typedef {Object} HookedOptions
 * @property {typeof HTMLElement=} Element Base element class that your component should extend
 * @property {string[]=} observedAttributes List of attributes that should trigger an update when they change
 * @property {(element: HTMLElement) => ParentNode=} attachRoot Function to pick a rendering root different than the default open `shadowRoot`
 */
/**
 * The `Hooked` factory allows you to build a custom `HTMLElement` that can work with hooks.
 *
 * @template T
 * @param {() => T} renderer A function that can run hooks and return a template that will be rendered with the passed `render` function
 * @param {(template: T, root: ParentNode) => void} render A function that renders a template genereated by the `renderer` function inside the given element in the DOM
 * @param {HookedOptions=} options Options to customize the behavior of the `Hooked` factory
 * @returns {CustomElementConstructor} A constructor for a custom element that will run hooks
 */
export function Hooked<T>(renderer: () => T, render: (template: T, root: ParentNode) => void, options?: HookedOptions | undefined): CustomElementConstructor;
/**
 * A static reference to some value
 *
 * @template T
 * @typedef {{value: T}} Ref
 */
/**
 * Create a reference to an object that will remain at the same address for the whole life of the component.
 * The value is then accessible through `ref.value`.
 *
 * @template T
 * @param {T} initialValue The initial value to be saved in the ref
 * @returns {Ref<T>} A static reference to a value
 */
export function useRef<T>(initialValue: T): Ref<T>;
/**
 * Only recreate the value when the deps change.
 *
 * If no deps are specified, the value will be created only once and won't ever change.
 *
 * The array of deps is otherwise spread as arguments of the callback function.
 * This allows you to define your callback function outside the scope of your component,
 * hence allowing you to enforce a clear list of deps for this function.
 *
 * You can also specify a custom `isEqual` function as last argument
 * that will compare new props with old props in order to confirm that they have changed.
 *
 * @template T
 * @template {any[]} D
 * @param {(...deps: D) => T} createValue A function that will create for the given deps
 * @param {D} deps A list of deps that will cause the hook to recreate the value when they change
 * @param {IsEqual<D>} isEqual A function to compare two successive versions of deps
 * @returns {T} The memoized value
 */
export function useMemoize<T, D extends any[]>(createValue: (...deps: D) => T, deps?: D, isEqual?: typeof isShallowEqual): T;
/**
 * A function that dispatches an action that will be interpreted by a reducer
 *
 * @template A
 * @typedef {(action: A) => void} Dispatch
 */
/**
 * A function to create the initial state of a reducer
 *
 * @template T
 * @template A
 * @typedef {(dispatch: Dispatch<A>, getState: () => T) => T} StateInit
 */
/**
 * Create a state managed by a reducer that returns the current value and a dispatch function to change it.
 *
 * When called, the dispatch function will run the reducer by taking the current state and the argument given to dispatch.
 * The result will be the new state.
 *
 * The passed `initialState` can be a function. In that case, it will receive 2 arguments `(dispatch, getState)`.
 * This allows you to define methods inside your state that can modify this state.
 *
 * @template T
 * @template A
 * @param {T | StateInit<T, A>} initialState The initial state or a function to create it
 * @param {(state: T, action: A) => void} reducer The reducer that will update state according to actions
 * @returns {[T, Dispatch<A>]} A couple with the current state and the dispatch function
 */
export function useReducer<T, A>(initialState: T | StateInit<T, A>, reducer: (state: T, action: A) => void): [T, Dispatch<A>];
/**
 * Allowed params for the setState method
 *
 * @template T
 * @typedef {T | ((value: T) => T)} SetState
 */
/**
 * Create a dynamic state that triggers an update when modified with the returned setter.
 *
 * @template T
 * @param {T | (() => T)} createState The initial state or a function to create it.
 * @returns {[T, Dispatch<SetState<T>>]} A couple with the current state and the setter to update it
 */
export function useState<T>(createState: T | (() => T)): [T, Dispatch<SetState<T>>];
/**
 * Create a complex state stored in an object.
 *
 * Calling the returned setter will shallow merge the given arguments with the previous state.
 *
 * The passed `createStore` can be a function. In that case, it will receive 2 arguments `(dispatch, getState)`.
 * This allows you to define store methods that can modify the state.
 *
 * @template {{ [key: string]: any }} T
 * @param {T | StateInit<T, SetState<Partial<T>>>} createStore The initial store or a function to create it.
 * @returns {[T, Dispatch<SetState<Partial<T>>>]} A couple with the current store and the setter to update it.
 */
export function useStore<T extends {
    [key: string]: any;
}>(createStore: T | StateInit<T, SetState<Partial<T>>>): [T, Dispatch<SetState<Partial<T>>>];
/**
 * A function that returns a Promise
 *
 * @typedef {(...args: any[]) => Promise<any>} AsyncFn
 */
/**
 * Extract the type of the return value of an async function
 *
 * @template {AsyncFn} F
 * @typedef {F extends (...args: any[]) => Promise<infer T> ? T : never} PromiseType
 */
/**
 * Store the current state of an async operation
 *
 * @template {AsyncFn} F
 * @typedef  {{
 *  loading: boolean,
 *  value: PromiseType<F> | undefined,
 *  error: Error | undefined,
 *  call: F
 * }} Async
 */
/**
 * A hook to track the changes in the evolution of an async function call.
 *
 * The if deps are given, the async function will be memoized using them and the optional isEqual argument.
 *
 * @template {AsyncFn} F
 * @param {F} asyncFn A function that returns a promise
 * @returns {Async<F>} A controller for the given async function
 */
export function useAsync<F extends AsyncFn>(asyncFn: F, deps?: any[], isEqual?: typeof isShallowEqual): Async<F>;
/**
 * A custom attribute getter/setter
 *
 * @template T
 * @typedef {Object} CustomAttribute
 * @property {T} defaultValue Default value of the attribute during initialization
 * @property {(attribute: string) => T} get Parse the attribute DOM string into the wanted type
 * @property {(value: T) => string} set Stringify the value into a string for the DOM
 */
/**
 * Extract the value type from an attribute's default value
 *
 * @template A
 * @typedef {A extends (() => CustomAttribute<infer T>) ? T : A} CustomAttributeValue
 */
/**
 * Actual type of attributes, with custom ones flattened.
 *
 * @template {{[name: string]: any}} A
 * @typedef {{ [name in keyof A]: CustomAttributeValue<A[name]>}} Attributes
 */
/**
 * Setup many attributes on a component.
 *
 * For these attributes to trigger update when they change, they should be added to the component `observedAttributes`.
 *
 * The attributes default values passed as argument will be used to guess the kind of parsing/serialization needed to interact with the attribute in the DOM.
 *
 * For example, if we have `{ "my-flag": true }`, the attribute will be shown as `"my-flag"=""` in the DOM.
 * If we have `{ "my-flag": false }`, the attribute will be removed.
 *
 * You can also customize the parsing/serialization by passing a function as default value.
 * This function should return an object with 3 keys:
 * - defaultValue: the initial value for this attribute
 * - get: a function that parses the attribute DOM string into the wanted value
 * - set: a function that serializes a value into a string to be written in the DOM
 *
 * @template {{ [name: string]: any }} A
 * @param {A} attributes A list of default values for some attributes
 * @returns {[Attributes<A>, (values: Attributes<Partial<A>>) => void]} A couple with the current attributes value and a function to update them
 */
export function useAttributes<A extends {
    [name: string]: any;
}>(attributes: A): [Attributes<A>, (values: Attributes<Partial<A>>) => void];
/**
 * Bind a list of properties to the current element.
 *
 * The properties are initialized with the given default value.
 * Then, any time they'll be modified, it will trigger an update.
 *
 * These properties are then accessible directly on the DOM element, wether they are values or functions.
 * This allows you to build an API to control your component from the outside.
 *
 * @template {{ [name: string]: any }} P
 * @param {P} properties A list of default values for some properties
 * @returns {[P, (values: Partial<P>) => void]} A couple with the current values of properties and a function to update them
 */
export function useProperties<P extends {
    [name: string]: any;
}>(properties: P): [P, (values: Partial<P>) => void];
/**
 * A function that dispatches an event with the given options.
 *
 * @template T
 * @typedef {(options?: CustomEventInit<T>) => CustomEvent<T>} DispatchEvent
 */
/**
 * Create an event dispatcher function that when called will dispatch the specified event with the given options.
 * These options can still be overriden when calling the dispatcher.
 *
 * @template T
 * @param {string} event The name of the event to dispatch
 * @param {CustomEventInit<T>=} options The options to dispatch the event with
 * @returns {DispatchEvent<T>} A function to dispatch the wanted event
 */
export function useEvent<T>(event: string, options?: CustomEventInit<T>): DispatchEvent<T>;
/**
 * A callback to a lifecycle event.
 *
 * @template {any[]} D
 * @typedef {(element: HTMLElement, ...deps: D) => void} LifeCycleCallback
 */
/**
 * A lifecycle hook that will run after a batch of update has finished but has not yet been rendered to the DOM.
 *
 * If no deps are specified, the callback will be run after every update.
 *
 * The array of deps is otherwise spread as arguments of the callback function.
 * This allows you to define your callback function outside the scope of your component,
 * hence allowing you to enforce a clear list of deps for this function.
 *
 * You can also specify a custom `isEqual` function as last argument
 * that will compare new props with old props in order to confirm that they have changed.
 *
 * @template {any[]} D
 * @param {LifeCycleCallback<D>} updatedCallback A callback to be run after an update but before render
 * @param {D=} deps A list of deps to limit when the callback will be called
 * @param {IsEqual<D>=} isEqual A function to check if deps have changed
 */
export function onUpdated<D extends any[]>(updatedCallback: LifeCycleCallback<D>, deps?: D, isEqual?: typeof isShallowEqual): void;
/**
 * A lifecycle hook that will run after a batch of update has been rendered to the DOM.
 *
 * If no deps are specified, the callback will be run after every update.
 *
 * The array of deps is otherwise spread as arguments of the callback function.
 * This allows you to define your callback function outside the scope of your component,
 * hence allowing you to enforce a clear list of deps for this function.
 *
 * You can also specify a custom `isEqual` function as last argument
 * that will compare new props with old props in order to confirm that they have changed.
 *
 * @template {any[]} D
 * @param {LifeCycleCallback<D>} renderedCallback A callback to be run after render
 * @param {D=} deps A list of deps to limit when the callback will be called
 * @param {IsEqual<D>=} isEqual A function to check if deps have changed
 */
export function onRendered<D extends any[]>(renderedCallback: LifeCycleCallback<D>, deps?: D, isEqual?: typeof isShallowEqual): void;
/**
 * Options to customize the behavior of the `Hooked` factory
 */
export type HookedOptions = {
    /**
     * Base element class that your component should extend
     */
    Element?: typeof HTMLElement | undefined;
    /**
     * List of attributes that should trigger an update when they change
     */
    observedAttributes?: string[] | undefined;
    /**
     * Function to pick a rendering root different than the default open `shadowRoot`
     */
    attachRoot?: (element: HTMLElement) => ParentNode;
};
/**
 * A static reference to some value
 */
export type Ref<T> = {
    value: T;
};
/**
 * A function that dispatches an action that will be interpreted by a reducer
 */
export type Dispatch<A> = (action: A) => void;
/**
 * A function to create the initial state of a reducer
 */
export type StateInit<T, A> = (dispatch: Dispatch<A>, getState: () => T) => T;
/**
 * Allowed params for the setState method
 */
export type SetState<T> = T | ((value: T) => T);
/**
 * A function that returns a Promise
 */
export type AsyncFn = (...args: any[]) => Promise<any>;
/**
 * Extract the type of the return value of an async function
 */
export type PromiseType<F extends AsyncFn> = F extends (...args: any[]) => Promise<infer T> ? T : never;
/**
 * Store the current state of an async operation
 */
export type Async<F extends AsyncFn> = {
    loading: boolean;
    value: PromiseType<F> | undefined;
    error: Error | undefined;
    call: F;
};
/**
 * A custom attribute getter/setter
 */
export type CustomAttribute<T> = {
    /**
     * Default value of the attribute during initialization
     */
    defaultValue: T;
    /**
     * Parse the attribute DOM string into the wanted type
     */
    get: (attribute: string) => T;
    /**
     * Stringify the value into a string for the DOM
     */
    set: (value: T) => string;
};
/**
 * Extract the value type from an attribute's default value
 */
export type CustomAttributeValue<A> = A extends () => CustomAttribute<infer T> ? T : A;
/**
 * Actual type of attributes, with custom ones flattened.
 */
export type Attributes<A extends {
    [name: string]: any;
}> = { [name in keyof A]: CustomAttributeValue<A[name]>; };
/**
 * A function that dispatches an event with the given options.
 */
export type DispatchEvent<T> = (options?: CustomEventInit<T>) => CustomEvent<T>;
/**
 * A callback to a lifecycle event.
 */
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
