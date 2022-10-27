const Hooks = createHookContext();

/**
 * Options to customize the behavior of the `withHooks` factory
 *
 * @typedef {Object} HookedOptions
 * @property {typeof HTMLElement} [Element] Base element class that your component should extend
 * @property {string[]} [observedAttributes] List of attributes that should trigger an update when they change
 * @property {(element: HTMLElement) => ParentNode} [attachRoot] Function to pick a rendering root different than the default open `shadowRoot`
 */

/**
 * The `withHooks` factory allows you to build a custom `HTMLElement` that can work with hooks.
 *
 * @template T
 * @param {() => T} renderer A function that can run hooks and return a template that will be rendered with the passed `render` function
 * @param {(template: T, root: ParentNode) => void} render A function that renders a template genereated by the `renderer` function inside the given element in the DOM
 * @param {HookedOptions} [options] Options to customize the behavior of the `withHooks` factory
 * @returns {CustomElementConstructor} A constructor for a custom element that will run hooks
 */
export function withHooks(renderer, render, options = {}) {
  return class HookedHTMLElement extends (options.Element ?? HTMLElement) {
    static observedAttributes = options.observedAttributes;

    renderRoot;

    hooks = [];
    hookIndex = -1;
    updateRequested = false;
    updated = Promise.resolve(true);

    constructor() {
      super();
      this.renderRoot = options.attachRoot?.(this) ?? this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.requestUpdate();
    }

    adoptedCallback() {
      this.requestUpdate();
    }

    attributeChangedCallback(_, oldValue, newValue) {
      if (newValue !== oldValue) {
        this.requestUpdate();
      }
    }

    disconnectedCallback() {
      this.clearEffects();
    }

    getHook = (index) => {
      return this.hooks[index].data;
    };

    setHook = (index, data) => {
      this.hooks[index].data = resolve(data, this.getHook(index));
    };

    registerHook = (type, createData = () => {}) => {
      const index = ++this.hookIndex;
      // only initialize the hook if it doesn't exist yet
      if (this.hooks[index] === undefined) this.hooks[index] = { type, data: createData() };
      return index;
    };

    runEffects = () => {
      this.hooks
        .filter((hook) => hook.type === "effect") //
        .forEach((hook) => hook.data.effect());
    };

    clearEffects = () => {
      this.hooks
        .filter((hook) => hook.type === "effect")
        .forEach((hook) => hook.data.clearEffect?.());
    };

    resolveUpdated = () => {};

    resetUpdated = () => {
      this.updated = new Promise((resolve) => {
        this.resolveUpdated = () => resolve(true);
      });
    };

    requestUpdate = async () => {
      if (!this.updateRequested) {
        this.resetUpdated(); // prepare the promise that will resolve once all sync updates are done and rendered
        this.updateRequested = true;
        await Promise.resolve(); // from this point, defer the execution of the rest of the function
        this.updateRequested = false;
        this.render(); // that way render() will be called only once, after all other sync updates are done
        this.resolveUpdated();
        this.runEffects();
      }
    };

    render = () => {
      Hooks.setContext(this);
      this.hookIndex = -1; // reset the hook index before registering hooks again
      const templateResult = renderer();
      return render(templateResult, this.renderRoot);
    };
  };
}

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
export function useRef(initialValue) {
  const element = Hooks.getContext();
  const index = element.registerHook("ref", () => ({ value: initialValue }));
  return element.getHook(index);
}

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
export function useReducer(initialState, reducer) {
  const element = Hooks.getContext();

  const index = element.registerHook("reducer", () => {
    function getState() {
      return element.getHook(index)[0];
    }

    function dispatch(state) {
      const oldState = getState();
      const newState = reducer(oldState, state);
      element.setHook(index, [newState, dispatch]);
      element.requestUpdate();
    }

    return [resolve(initialState, dispatch, getState), dispatch];
  });

  return element.getHook(index);
}

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
export function useState(createState) {
  return useReducer(resolve(createState), (oldState, newState) => resolve(newState, oldState));
}

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
 * Creates a wrapper around an async function that allows tracking the evolution of the async operation
 * while preventing racing conditions between consecutive calls.
 *
 * @template {AsyncFn} F
 * @param {F} asyncFn A function that returns a promise
 * @returns {Async<F>} A controller for the given async function
 */
export function useAsync(asyncFn) {
  // function to create a store that tracks the evolution of an async call
  const asyncStore = (setState, getState) => ({
    loading: false,
    value: undefined,
    error: undefined,

    // function to cancel the last async call
    cancel() {},

    // function to start the async call and update the state as it evolves
    async call(...args) {
      // cancel last call so it cannot update the state during newer calls
      getState().cancel();

      // prepare the function to cancel this call
      let cancelled = false;
      const cancel = () => (cancelled = true);

      try {
        if (!cancelled) setState({ loading: true, cancel });
        const value = await asyncFn(...args);
        if (!cancelled) setState({ loading: false, error: undefined, value });
        return value;
      } catch (error) {
        if (!cancelled) setState({ loading: false, value: undefined, error });
      }
    },
  });

  // reducer that merges new state with old state on dispatch
  const mergeState = (oldState, newState) => ({ ...oldState, ...newState });

  // only return the state of the reducer hook
  return useReducer(asyncStore, mergeState)[0];
}

/**
 * Setup many attributes on a component.
 *
 * For these attributes to trigger an update when they change, they should be added to the component `observedAttributes`.
 *
 * The given attributes default values will be used to guess the kind of parsing needed to interact with the attribute in the DOM.
 *
 * For example, if we have `{ "my-flag": true }`, the attribute shown as `"my-flag"=""` in the DOM will be parsed as `true`
 * but if the attribute isn't found, it will be parsed as `false`.
 *
 * You can also customize the parsing by passing a function as default value.
 * This function takes the attribute string from the DOM and parses it to the type you need
 *
 * @template {{ [name: string]: any }} A
 * @param {A} attributes A list of default values for some attributes
 * @returns {A} The current attribute values on the element
 */
export function useAttributes(attributes) {
  const element = Hooks.getContext();

  const index = element.registerHook("attributes", () => {
    // grap and parse the current list of values for the wanted attributes
    return function getAttributes() {
      return Object.fromEntries(
        Object.keys(attributes).map((name) => [name, getAttribute(element, name, attributes[name])])
      );
    };
  });

  // recompute the list of attributes on every render
  return element.getHook(index)();
}

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
 * @returns {P} The current property values
 */
export function useProperties(properties) {
  const element = Hooks.getContext();

  const index = element.registerHook("properties", () => {
    const propertyNames = Object.keys(properties);

    // start observing listed properties and initialize the unspecified ones with default values
    propertyNames.forEach((name) => observeProperty(element, name, properties[name]));

    // build a list of properties based of their value inside the element
    return function getProperties() {
      return Object.fromEntries(propertyNames.map((name) => [name, element[name]]));
    };
  });

  // recompute the list of properties every time the component is rendered
  return element.getHook(index)();
}

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
 * @param {CustomEventInit<T>} [options] The options to dispatch the event with
 * @returns {DispatchEvent<T>} A function to dispatch the wanted event
 */
export function useEvent(event, options) {
  const element = Hooks.getContext();

  const index = element.registerHook("event", () => {
    // create a function that dispatches the event configured by this hook
    return function dispatchEvent(eventOptions) {
      const _event = new CustomEvent(event, { ...options, ...eventOptions });
      element.dispatchEvent(_event);
      return _event;
    };
  });

  return element.getHook(index);
}

/**
 * A function to check if two different list of deps are actually the same
 *
 * @template {any[]} D
 * @typedef {(deps: D | undefined, oldDeps: D | undefined) => boolean} IsEqual
 */

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
 * that will compare new deps with old deps in order to confirm that they have changed.
 *
 * @template T
 * @template {any[]} D
 * @param {(...deps: D) => T} createValue A function that will create for the given deps
 * @param {D} deps A list of deps that will cause the hook to recreate the value when they change
 * @param {IsEqual<D>} isEqual A function to compare two successive versions of deps
 * @returns {T} The memoized value
 */
export function useMemoize(createValue, deps = [], isEqual = isShallowEqual) {
  const element = Hooks.getContext();

  const index = element.registerHook("memoize", () => {
    function getValue() {
      const hook = element.getHook(index);
      if (isEqual(hook.deps, hook.oldDeps)) return hook.value;

      const value = createValue(...hook.deps);
      element.setHook(index, { getValue, value, oldDeps: hook.deps });
      return value;
    }

    return { getValue };
  });

  const hook = element.getHook(index);
  // update the list of deps on every render so getValue can check them later
  element.setHook(index, { ...hook, deps });
  // return the memoized value or recompute it if deps have changed
  return hook.getValue();
}

/**
 * A callback to a lifecycle event.
 *
 * @template {any[]} D
 * @typedef {(element: HTMLElement, ...deps: D) => void | (() => void)} EffectCallback
 */

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
 * that will compare new deps with old deps in order to confirm that they have changed.
 *
 * @template {any[]} D
 * @param {EffectCallback<D>} effectCallback A callback to be run after an update
 * @param {D} [deps] A list of deps to limit when the callback will be called
 * @param {IsEqual<D>} [isEqual] A function to check if deps have changed
 */
export function useEffect(effectCallback, deps, isEqual = isShallowEqual) {
  const element = Hooks.getContext();

  const index = element.registerHook("effect", () => {
    function effect() {
      const hook = element.getHook(index);
      // rerun side effect only if deps have changed
      if (!isEqual(hook.deps, hook.oldDeps)) {
        if (hook.clearEffect) hook.clearEffect();
        const clearEffect = effectCallback(element, ...(hook.deps ?? []));
        element.setHook(index, { effect, clearEffect, olDeps: hook.deps });
      }
    }

    return { effect };
  });

  // update the list of deps on every render so the callback can check them later
  element.setHook(index, (previous) => ({ ...previous, deps }));
}

function observeProperty(element, property, defaultValue) {
  const _property = `_${property}`;

  // save the base value inside the hidden property
  element[_property] = element[_property] ?? element[property] ?? defaultValue;

  // in case we're passing a function, bind its this to the current element
  if (typeof element[_property] === "function") {
    element[_property] = element[_property].bind(element);
  }

  // define a proxy to access this hidden value
  Object.defineProperty(element, property, {
    enumerable: true,
    get() {
      return element[_property];
    },
    set(value) {
      if (element[_property] !== value) {
        element[_property] = value;
        element.requestUpdate();
      }
    },
  });
}

function getAttribute(element, name, defaultValue) {
  const type = typeof defaultValue;
  const attribute = element.getAttribute(name);
  if (type === "boolean") return attribute === "";
  if (attribute === null) return defaultValue;
  if (type === "string") return attribute;
  if (type === "number") return parseInt(attribute, 10);
  else return JSON.parse(attribute);
}

function createHookContext() {
  let _element = undefined;
  return {
    getContext: () => _element,
    setContext: (element) => (_element = element),
  };
}

function isShallowEqual(deps, oldDeps) {
  if (deps === undefined || oldDeps === undefined) return false;
  if (deps.length !== oldDeps.length) return false;
  else return deps.every((_, i) => deps[i] === oldDeps[i]);
}

function resolve(data, ...args) {
  return typeof data === "function" ? data(...args) : data;
}
