const Hooks = createHookContext();

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
export function Hooked(renderer, render, options = {}) {
  return class HookedHTMLElement extends (options.Element ?? HTMLElement) {
    static observedAttributes = options.observedAttributes;

    renderRoot;

    hooks = [];
    hookIndex = -1;
    updateRequested = false;
    rendered = Promise.resolve(true);

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

    attributeChangedCallback() {
      this.requestUpdate();
    }

    disconnectedCallback() {
      this.clearLifeCycleCallbacks("rendered");
      this.clearLifeCycleCallbacks("updated");
    }

    getHook = (index) => {
      return this.hooks[index].data;
    };

    setHook = (index, data) => {
      this.hooks[index].data = data;
    };

    registerHook = (type, createData = () => {}) => {
      const index = ++this.hookIndex;
      // only initialize the hook if it doesn't exist yet
      if (this.hooks[index] === undefined) this.hooks[index] = { type, data: createData() };
      return index;
    };

    runLifeCycleCallbacks = (step) => {
      this.hooks
        .filter((hook) => hook.type === "lifecycle" && hook.data.step === step)
        .forEach((hook) => hook.data.callback?.(this));
    };

    clearLifeCycleCallbacks = (step) => {
      this.hooks
        .filter((hook) => hook.type === "lifecycle" && hook.data.step === step)
        .forEach((hook) => hook.data.clearCallback?.());
    };

    resolveRendered = () => {};

    resetRendered = () => {
      this.rendered = new Promise((resolve) => {
        this.resolveRendered = () => resolve(true);
      });
    };

    requestUpdate = async () => {
      if (!this.updateRequested) {
        this.resetRendered(); // prepare the promise that will resolve once all sync updates are done and rendered
        this.updateRequested = true;
        await Promise.resolve(); // from this point, defer the execution of the rest of the function
        this.updateRequested = false;
        this.render(); // that way render() will be called only once, after all other sync updates are done
        this.resolveRendered?.();
      }
    };

    render = () => {
      Hooks.setContext(this);
      this.hookIndex = -1; // reset the hook index before registering hooks again
      const templateResult = renderer();
      this.runLifeCycleCallbacks("updated");
      render(templateResult, this.renderRoot);
      this.runLifeCycleCallbacks("rendered");
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
export function useMemoize(createValue, deps = [], isEqual = isShallowEqual) {
  const element = Hooks.getContext();
  const index = element.registerHook("memoize", () => ({ value: createValue(...deps) }));
  const previous = element.getHook(index);

  // update hook value when deps change, and only once if no deps are provided
  if (!isEqual(deps, previous.deps)) {
    element.setHook(index, { deps, value: createValue(...deps) });
  }

  // extrat the actual value from current hook cache
  return element.getHook(index).value;
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
export function useStore(createStore) {
  return useReducer(createStore, (state, partial) => ({ ...state, ...resolve(partial, state) }));
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
 * A hook to track the changes in the evolution of an async function call.
 *
 * The if deps are given, the async function will be memoized using them and the optional isEqual argument.
 *
 * @template {AsyncFn} F
 * @param {F} asyncFn A function that returns a promise
 * @returns {Async<F>} A controller for the given async function
 */
export function useAsync(asyncFn, deps = [], isEqual = isShallowEqual) {
  const cancelRef = useRef(() => {});

  const [store, setStore] = useStore({
    loading: false,
    value: undefined,
    error: undefined,
  });

  const call = useMemoize(
    (...deps) =>
      async (...args) => {
        // call the async function and track its evolution in the state
        // cancel last call so it cannot update the state during newer calls
        cancelRef.value();

        // prepare the function to cancel this call
        let cancelled = false;
        cancelRef.value = () => (cancelled = true);

        try {
          if (!cancelled) setStore({ loading: true });
          const value = await asyncFn(...args, ...deps);
          if (!cancelled) setStore({ loading: false, error: undefined, value });
          return value;
        } catch (error) {
          if (!cancelled) setStore({ loading: false, value: undefined, error });
        }
      },
    deps,
    isEqual
  );

  return { ...store, call };
}

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
export function useAttributes(attributes) {
  const element = Hooks.getContext();
  const attrNames = Object.keys(attributes);

  const index = element.registerHook("attributes", () => {
    function getAttributes() {
      return Object.fromEntries(
        attrNames.map((name) => [name, getAttribute(element, name, attributes[name])])
      );
    }

    // create a function that can update many attributes at once
    function setAttributes(values) {
      const _values = resolve(values, getAttributes());
      Object.keys(_values).forEach((name) => {
        if (name in attributes) {
          setAttribute(element, name, attributes[name], _values[name]);
        }
      });
    }

    return [getAttributes, setAttributes];
  });

  // initialize unspecified attributes with default values
  onUpdated(() => {
    attrNames
      .filter((name) => !element.hasAttribute(name))
      .forEach((name) => setAttribute(element, name, attributes[name], attributes[name])); // prettier-ignore
  }, []);

  // recompute the list of attributes on every render
  const [getAttributes, setAttributes] = element.getHook(index);
  return [getAttributes(), setAttributes];
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
 * @returns {[P, (values: Partial<P>) => void]} A couple with the current values of properties and a function to update them
 */
export function useProperties(properties) {
  const element = Hooks.getContext();
  const propNames = Object.keys(properties);

  const index = element.registerHook("properties", () => {
    // build a list of properties based of their value inside the element
    function getProperties() {
      return Object.fromEntries(
        propNames.map((name) => [name, name in element ? element[name] : properties[name]])
      );
    }

    // create a function that can update many properties at once
    function setProperties(values) {
      const _values = resolve(values, getProperties());
      Object.keys(_values).forEach((name) => {
        if (name in properties) {
          element[name] = _values[name];
        }
      });
    }

    return [getProperties, setProperties];
  });

  // on first update, start observing listed properties and initialize the unspecified ones with default values
  onUpdated(() => {
    propNames.forEach((name) => observeProperty(element, name, properties[name]));
  }, []);

  // recompute the list of properties every time the component is rendered
  const [getProperties, setProperties] = element.getHook(index);
  return [getProperties(), setProperties];
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
 * @param {CustomEventInit<T>=} options The options to dispatch the event with
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
export function onUpdated(updatedCallback, deps, isEqual) {
  useLifeCycleWithDeps("updated", updatedCallback, deps, isEqual);
}

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
export function onRendered(renderedCallback, deps, isEqual) {
  useLifeCycleWithDeps("rendered", renderedCallback, deps, isEqual);
}

function useLifeCycleWithDeps(step, stepCallback, deps, isEqual = isShallowEqual) {
  const element = Hooks.getContext();

  const index = element.registerHook("lifecycle", () => ({ step }));
  const previous = element.getHook(index);

  // rerun side effect only if deps have changed
  function callback() {
    if (!isEqual(deps, previous.deps)) {
      previous.clearCallback?.();
      const clearCallback = stepCallback(element, ...(deps ?? []));
      element.setHook(index, { step, callback, clearCallback, deps });
    }
  }

  // update the callback function on every render so it's fresh when it's called
  element.setHook(index, { step, callback, deps: previous.deps });
}

function observeProperty(element, property, defaultValue) {
  const _property = `_${property}`;

  // save the base value inside the hidden property
  element[_property] = element[_property] ?? element[property] ?? defaultValue;

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
  if (type === "function") return defaultValue().get(attribute);
  else return JSON.parse(attribute);
}

function setAttribute(element, name, defaultValue, value) {
  const type = typeof defaultValue;

  if (type === "function") {
    const builder = defaultValue();
    const _value = value === defaultValue ? builder.defaultValue : value;
    return element.setAttribute(name, builder.set(_value));
  }

  if (type === "boolean") {
    if (value) return element.setAttribute(name, "");
    else return element.removeAttribute(name);
  }

  let attribute = "";
  if (type === "string") attribute = value;
  else if (type === "number") attribute = value.toString();
  else attribute = JSON.stringify(value);

  return element.setAttribute(name, attribute);
}

function createHookContext() {
  let _element = undefined;
  return {
    getContext: () => _element,
    setContext: (element) => (_element = element),
  };
}

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
function isShallowEqual(deps, oldDeps) {
  if (deps === undefined || oldDeps === undefined) return false;
  if (deps.length !== oldDeps.length) return false;
  else return deps.every((_, i) => deps[i] === oldDeps[i]);
}

/**
 * @template T
 * @template {any[]} A
 * @param {T | ((...args: A) => T)} data
 * @param  {A} oldData
 * @returns {T}
 */
function resolve(data, ...oldData) {
  return typeof data === "function" ? data(...oldData) : data;
}
