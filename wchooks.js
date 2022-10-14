const HookContext = createHookContext();

export function Component(renderer, render, options = {}) {
  return class HookElement extends (options.Element ?? HTMLElement) {
    static observedAttributes = options.observedAttributes;

    _root;
    _hooks = [];
    _updateRequested = false;

    constructor() {
      super();
      this._root = options.attachRoot?.(this) ?? this.attachShadow({ mode: "open" });
      this.render(); // dry run the renderer so we register the first hooks
      this.appendStyles(); // create the required style tag as soon as the component is created
      this.runLifeCycleCallbacks("created", this);
    }

    connectedCallback() {
      this.requestUpdate();
      this.runLifeCycleCallbacks("connected", this);
    }

    adoptedCallback() {
      this.requestUpdate();
      this.runLifeCycleCallbacks("adopted", this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.requestUpdate();
      this.runLifeCycleCallbacks("attributeChanged", this, name, oldValue, newValue);
    }

    disconnectedCallback() {
      this.runLifeCycleCallbacks("disconnected", this);
      this.clearLifeCycleCallbacks("rendered");
      this.clearLifeCycleCallbacks("updated");
    }

    getHook = (index) => {
      return this._hooks[index].data;
    };

    setHook = (index, data) => {
      this._hooks[index].data = data;
    };

    registerHook = (index, type, createData) => {
      // only update the hook if it was non-existent
      if (this._hooks[index] === undefined) {
        this._hooks[index] = { type, data: createData() };
      }
      return this.getHook(index);
    };

    runLifeCycleCallbacks(step, ...args) {
      for (const hook of this._hooks) {
        if (hook.type === "lifecycle" && hook.data.step === step) {
          hook.data.callback?.(...args);
        }
      }
    }

    clearLifeCycleCallbacks(step) {
      for (const hook of this._hooks) {
        if (hook.type === "lifecycle" && hook.data.step === step) {
          hook.data.clearSideEffect?.();
        }
      }
    }

    appendStyles = () => {
      for (const hook of this._hooks) {
        if (hook.type === "style") {
          this._root.append(hook.data);
        }
      }
    };

    requestUpdate = async () => {
      if (!this._updateRequested) {
        this._updateRequested = true;
        this._updateRequested = await false; // defer the execution of the function starting from here
        this.update(); // that way update() will be called only after all other sync operations are done
      }
    };

    update = () => {
      const templateResult = this.render();
      this.runLifeCycleCallbacks("updated", this);
      render(templateResult, this._root);
      this.runLifeCycleCallbacks("rendered", this);
    };

    render = () => {
      HookContext.setHookContext(this);
      return renderer();
    };
  };
}

export function useRef(initialValue) {
  const [index, context] = HookContext.getHookContext();
  return context.registerHook(index, "ref", () => ({ value: initialValue }));
}

export function useMemoize(createValue, deps = []) {
  const [index, context] = HookContext.getHookContext();
  const previous = context.registerHook(index, "memoize", () => ({ value: createValue() }));

  if (hasChangedDeps(deps, previous.deps)) {
    context.setHook(index, { value: createValue(), deps });
  }

  // register hook and extrat the actual value from current hook cache
  return context.getHook(index).value;
}

export function useMemoizeFn(fn, deps = []) {
  return useMemoize(() => fn, deps);
}

export function useAsync(asyncFn, deps) {
  const cancelPrevious = useRef();

  const [state, commit] = useReducer(
    { loading: false, value: undefined, error: undefined },
    (oldState, newState) => ({ ...oldState, ...newState })
  );

  const callAsyncFn = useMemoizeFn(async (...args) => {
    let cancelled = false;
    cancelPrevious.value?.(); // cancel previous call so it cannot update the state later
    cancelPrevious.value = () => (cancelled = true); // prepare the cancel function for the current call

    try {
      if (!cancelled) commit({ loading: true });
      const value = await asyncFn(...args);
      if (!cancelled) commit({ loading: false, error: undefined, value });
      return value;
    } catch (error) {
      if (!cancelled) commit({ loading: false, value: undefined, error });
    }
  }, deps);

  return { ...state, call: callAsyncFn };
}

export function useState(initialState) {
  return useReducer(initialState, (oldState, state) => resolveData(state, oldState));
}

export function useReducer(initialState, reducer) {
  const [index, context] = HookContext.getHookContext();

  function dispatch(action) {
    const [oldState, _dispatch] = context.getHook(index);
    const state = reducer(oldState, action);
    context.setHook(index, [state, _dispatch]);
    context.requestUpdate();
  }

  return context.registerHook(index, "reducer", () => [initialState, dispatch]);
}

export function useAttribute(attribute, { get = (v) => v, set = String } = {}) {
  const [index, context] = HookContext.getHookContext();

  const value = get(context.getAttribute(attribute));

  const setAttribute = context.registerHook(index, "attribute", () => {
    return function setAttribute(value) {
      const oldValue = get(context.getAttribute(attribute));
      const nextValue = resolveData(value, oldValue);
      context.setAttribute(attribute, set(nextValue));
    };
  });

  return [value, setAttribute];
}

export function useProperty(property, initialValue) {
  const [index, context] = HookContext.getHookContext();

  // as soon as the component is created, setup a proxy to the prop to allow tracking its updates
  onCreated(() => observeProperty(context, property, initialValue));

  const value = context[property] ?? initialValue;

  const setProperty = context.registerHook(index, "property", () => {
    return function setProperty(value) {
      const oldValue = context[property];
      const nextValue = resolveData(value, oldValue);
      context[property] = nextValue;
    };
  });

  return [value, setProperty];
}

export function useEvent(name, options) {
  const [index, context] = HookContext.getHookContext();

  return context.registerHook(index, "event", () => {
    return function dispatchEvent(eventOptions) {
      const event = new CustomEvent(name, { ...options, ...eventOptions });
      context.dispatchEvent(event);
      return event;
    };
  });
}

export function useEventListener(name, callback, deps, options) {
  onRendered((element) => {
    element.addEventListener(name, callback, options);
    return () => element.removeEventListener(name, callback);
  }, deps);
}

export function useStyle(css) {
  const [index, context] = HookContext.getHookContext();
  const style = context.registerHook(index, "style", () => document.createElement("style"));
  onUpdated(() => { style.textContent = css }, [css]); // prettier-ignore
}

function useLifeCycle(step, callback) {
  const [index, context] = HookContext.getHookContext();
  context.registerHook(index, "lifecycle", () => ({ step, callback }));
  context.setHook(index, { step, callback }); // update the callback function on every render
}

export function onCreated(createdCallback) {
  useLifeCycle("created", createdCallback);
}

export function onAttributeChanged(attributeChangedCallback) {
  useLifeCycle("attributeChanged", attributeChangedCallback);
}

export function onAdopted(adoptedCallback) {
  useLifeCycle("adopted", adoptedCallback);
}

export function onConnected(connectedCallback) {
  useLifeCycle("connected", connectedCallback);
}

export function onDisconnected(disconnectedCallback) {
  useLifeCycle("disconnected", disconnectedCallback);
}

function useLifeCycleWithDeps(step, sideEffect, deps) {
  const [index, context] = HookContext.getHookContext();

  const previous = context.registerHook(index, "lifecycle", () => ({}));

  function callback(...args) {
    // rerun side effect if at least one dep has changed
    if (hasChangedDeps(deps, previous.deps)) {
      previous.clearSideEffect?.();
      const clearSideEffect = sideEffect(...args);
      context.setHook(index, { step, callback, clearSideEffect, deps });
    }
  }

  context.setHook(index, { step, callback, deps });
}

export function onUpdated(updatedCallback, deps) {
  useLifeCycleWithDeps("updated", updatedCallback, deps);
}

export function onRendered(renderedCallback, deps) {
  useLifeCycleWithDeps("rendered", renderedCallback, deps);
}

function createHookContext() {
  let index = 0;
  let hookContext = undefined;

  return {
    getHookContext: () => [
      index++, //
      hookContext,
    ],
    setHookContext: (element) => {
      index = 0;
      hookContext = element;
    },
  };
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
      element[_property] = value;
      element.requestUpdate();
    },
  });
}

function hasChangedDeps(deps = null, oldDeps = null) {
  if (deps === null || oldDeps === null) return true;
  if (Array.isArray(deps) && Array.isArray(oldDeps)) return deps.some((dep, i) => oldDeps[i] !== dep); // prettier-ignore
  if (deps.hasChanged && oldDeps.deps) return deps.hasChanged(deps.deps, oldDeps.deps);
  return true;
}

function resolveData(data, oldData) {
  return typeof data === "function" ? data(oldData) : data;
}
