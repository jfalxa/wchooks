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
      return this._hooks[index];
    };

    setHook = (index, data) => {
      this._hooks[index] = data;
      return this._hooks[index];
    };

    registerHook = (index, data) => {
      // only update the hook if it was non-existent
      if (this._hooks[index] === undefined) {
        this._hooks[index] = data;
      }
      return this._hooks[index];
    };

    runLifeCycleCallbacks(step, ...args) {
      for (const hook of this._hooks) {
        if (hook instanceof Object && step in hook) {
          hook[step][0]?.(...args); // run lifecycle side effect
        }
      }
    }

    clearLifeCycleCallbacks(step) {
      for (const hook of this._hooks) {
        if (hook instanceof Object && step in hook) {
          hook[step][1]?.(); // clear lifecycleside effect
        }
      }
    }

    appendStyles = () => {
      for (const hook of this._hooks) {
        if (hook instanceof Object && hook[0] instanceof HTMLStyleElement) {
          this._root.append(hook[0]);
        }
      }
    };

    requestUpdate = async () => {
      if (!this._updateRequested) {
        this._updateRequested = true;
        this._updateRequested = await false;
        this.update();
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
  return context.registerHook(index, { value: initialValue });
}

export function useMemoize(createValue, deps = []) {
  const [index, context] = HookContext.getHookContext();
  const [oldValue, oldDeps] = context.getHook(index) ?? [createValue()]; // only create the value if it was undefined

  if (hasChangedDeps(deps, oldDeps)) {
    context.setHook(index, [createValue(), deps]);
  }

  // register hook and extract the actual value from current hook cache
  return context.registerHook(index, [oldValue, oldDeps])[0];
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

  return context.registerHook(index, [initialState, dispatch]);
}

export function useAttribute(attribute, { get = (v) => v, set = String } = {}) {
  const [index, context] = HookContext.getHookContext();

  function setAttribute(value) {
    const oldValue = get(context.getAttribute(attribute));
    const nextValue = resolveData(value, oldValue);
    context.setAttribute(attribute, set(nextValue));
  }

  const value = get(context.getAttribute(attribute));
  const hook = context.registerHook(index, { setAttribute });

  return [value, hook.setAttribute];
}

export function useProperty(property, initialValue) {
  const [index, context] = HookContext.getHookContext();

  // as soon as the component is created, setup a proxy to the prop to allow tracking its updates
  onCreated(() => observeProperty(context, property, initialValue));

  function setProperty(value) {
    const oldValue = context[property];
    const nextValue = resolveData(value, oldValue);
    context[property] = nextValue;
  }

  const value = context[property] ?? initialValue;
  const hook = context.registerHook(index, { setProperty });

  return [value, hook.setProperty];
}

export function useEvent(name, options) {
  const [index, context] = HookContext.getHookContext();

  function dispatchEvent(eventOptions) {
    const event = new CustomEvent(name, { ...options, ...eventOptions });
    context.dispatchEvent(event);
    return event;
  }

  return context.registerHook(index, dispatchEvent);
}

export function useEventListener(name, callback, deps, options) {
  onRendered((element) => {
    element.addEventListener(name, callback, options);
    return () => element.removeEventListener(name, callback);
  }, deps);
}

export function useStyle(css) {
  const style = useMemoize(() => document.createElement("style"));
  onUpdated(() => { style.textContent = css }, [css]); // prettier-ignore
}

function useLifeCycle(step, sideEffect) {
  const [index, context] = HookContext.getHookContext();
  context.setHook(index, { [step]: [sideEffect] });
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

  const hook = context.getHook(index) ?? { [step]: [] };
  const [_, clearOldSideEffect, oldDeps] = hook[step];

  function _sideEffect(...args) {
    // rerun side effect if at least one dep has changed
    if (hasChangedDeps(deps, oldDeps)) {
      if (clearOldSideEffect) clearOldSideEffect();
      const clearSideEffect = sideEffect(...args);
      context.setHook(index, { [step]: [_sideEffect, clearSideEffect, deps] });
    }
  }

  context.setHook(index, { [step]: [_sideEffect, clearOldSideEffect, oldDeps] });
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
