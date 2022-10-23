const Hooks = createHookContext();

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
      this.clearLifeCycleCallbacks("updated");
      this.clearLifeCycleCallbacks("rendered");
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
 * @template T
 * @param {T} initialValue
 * @returns {{ value: T }}
 */
export function useRef(initialValue) {
  const element = Hooks.getContext();
  const index = element.registerHook("ref", () => ({ value: initialValue }));
  return element.getHook(index);
}

/**
 * @template T
 * @template {any[]} D
 * @param {(...deps: D) => T} createValue
 * @param {D} deps
 * @param {IsEqual<D>} isEqual
 * @returns {T}
 */
export function useMemoize(createValue, deps, isEqual = isShallowEqual) {
  const element = Hooks.getContext();
  const index = element.registerHook("memoize", () => ({ value: createValue(...deps) }));
  const previous = element.getHook(index);

  // update hook value when deps change, and only once if no deps are provided
  if (!isEqual(deps ?? [], previous.deps ?? [])) {
    element.setHook(index, { deps, value: createValue(...deps) });
  }

  // extrat the actual value from current hook cache
  return element.getHook(index).value;
}

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
 * @template T
 * @typedef {T | ((value: T) => T)} SetState
 */

/**
 * @template T
 * @param {T | (() => T)} createState
 * @returns {[T, Dispatch<SetState<T>>]}
 */
export function useState(createState) {
  return useReducer(resolve(createState), (oldState, newState) => resolve(newState, oldState));
}

/**
 * @template T
 * @param {T | StateInit<T, SetState<Partial<T>>>} createStore
 * @returns {[T, Dispatch<SetState<Partial<T>>>]}
 */
export function useStore(createStore) {
  return useReducer(createStore, (state, partial) => ({ ...state, ...resolve(partial, state) }));
}

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
export function useAsync(asyncFn) {
  const createAsyncStore = (setState, getState) => ({
    // state to track the evolution of the async operation
    loading: false,
    value: undefined,
    error: undefined,

    // calling this method will cancel the last call of the async method
    cancel() {},

    // call the async function and track its evolution in the state
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

  return useStore(createAsyncStore)[0];
}

/**
 * @template {{ [name: string]: any }} A
 * @typedef {{ [name in keyof A]: A[name] }} Attributes
 */

/**
 * @template {{ [name: string]: any }} A
 * @param {Attributes<A>} attributes
 * @returns {[Attributes<A>, (values: Partial<Attributes<A>>) => void]}
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
 * @template {{ [name: string]: any }} P
 * @typedef {{ [name in keyof P]: P[name] }} Properties
 */

/**
 * @template {{ [name: string]: any }} P
 * @param {Properties<P>} properties
 * @returns {[Properties<P>, (values: Partial<Properties<P>>) => void]}
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
 * @template T
 * @typedef {(options?: CustomEventInit<T>) => CustomEvent<T>} DispatchEvent
 */

/**
 * @template T
 * @param {string} event
 * @param {CustomEventInit<T>=} options
 * @returns {DispatchEvent<T>}
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
export function onUpdated(updatedCallback, deps, isEqual) {
  useLifeCycleWithDeps("updated", updatedCallback, deps, isEqual);
}

/**
 * @template {any[]} D
 * @param {LifeCycleCallback<D>} renderedCallback
 * @param {D=} deps
 * @param {IsEqual<D>=} isEqual
 * @returns {void}
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
