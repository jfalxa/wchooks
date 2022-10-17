const Hooks = createHookContext();

export function Component(renderer, options = {}) {
  return class HookedHTMLElement extends (options.Element ?? HTMLElement) {
    static observedAttributes = options.observedAttributes;

    _root;
    _hooks = [];
    _updateRequested = false;

    constructor() {
      super();
      this._root = options.attachRoot?.(this) ?? this.attachShadow({ mode: "open" });
      this.callRenderer(); // dry run the renderer so we register the first hooks
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

    forEachHook = (type, callback) => {
      for (const hook of this._hooks) {
        if (hook.type === type) callback(hook.data);
      }
    };

    runLifeCycleCallbacks = (step, ...args) => {
      this.forEachHook("lifecycle", (data) => {
        if (data.step === step) data.callback?.(...args);
      });
    };

    clearLifeCycleCallbacks = (step) => {
      this.forEachHook("lifecycle", (data) => {
        if (data.step === step) data.clearSideEffect?.();
      });
    };

    appendStyles = () => {
      this.forEachHook("style", (style) => this._root.append(style));
    };

    requestUpdate = async () => {
      if (!this._updateRequested) {
        this._updateRequested = true;
        await Promise.resolve(); // defer the execution of the function starting from here
        this._updateRequested = false;
        this.update(); // that way update() will be called only after all other sync operations are done
      }
    };

    update = async () => {
      this.render();
      this.runLifeCycleCallbacks("rendered", this);
    };

    callRenderer = () => {
      Hooks.setContext(this);
      return renderer();
    };

    render = () => {
      const templateResult = this.callRenderer();
      const _render = options.render ?? render;
      return _render(templateResult, this._root);
    };
  };
}

export function useRef(initialValue) {
  const [index, element] = Hooks.getContext();
  return element.registerHook(index, "ref", () => ({ value: initialValue }));
}

export function useMemoize(createValue, deps = []) {
  const [index, element] = Hooks.getContext();
  const previous = element.registerHook(index, "memoize", () => ({ value: createValue() }));

  if (hasChangedDeps(deps, previous.deps)) {
    element.setHook(index, { value: createValue(), deps });
  }

  // register hook and extrat the actual value from current hook cache
  return element.getHook(index).value;
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
  const [index, element] = Hooks.getContext();

  return element.registerHook(index, "reducer", () => [
    initialState,
    (action) => {
      const [oldState, _dispatch] = element.getHook(index);
      const state = reducer(oldState, action);
      element.setHook(index, [state, _dispatch]);
      element.requestUpdate();
    },
  ]);
}

export function useAttribute(attribute, { get = (v) => v, set = String } = {}) {
  const [index, element] = Hooks.getContext();

  const value = get(element.getAttribute(attribute));

  const setAttribute = element.registerHook(index, "attribute", () => {
    return function setAttribute(value) {
      const oldValue = get(element.getAttribute(attribute));
      const nextValue = resolveData(value, oldValue);
      element.setAttribute(attribute, set(nextValue));
    };
  });

  return [value, setAttribute];
}

export function useProperty(property, initialValue) {
  const [index, element] = Hooks.getContext();

  // as soon as the component is created, setup a proxy to the prop to allow tracking its updates
  onCreated(() => observeProperty(element, property, initialValue));

  const value = element[property] ?? initialValue;

  const setProperty = element.registerHook(index, "property", () => {
    return function setProperty(value) {
      const oldValue = element[property];
      const nextValue = resolveData(value, oldValue);
      element[property] = nextValue;
    };
  });

  return [value, setProperty];
}

export function useMethod(method, fn, deps) {
  // memoize the function according to deps
  const methodFn = useMemoizeFn(fn, deps);

  // as soon as the component is created, add the method to the element
  onCreated((element) => (element[method] = methodFn));

  // then update the method every time the deps change
  onRendered((element) => {
    element[method] = methodFn;
  }, deps);

  return methodFn;
}

export function useQuerySelector(selector, deps) {
  const ref = useRef();

  // udpate the ref with a new query result every time the deps change
  onRendered((element) => {
    ref.value = element._root.querySelector(selector);
  }, deps);

  return ref;
}

export function useQuerySelectorAll(selector, deps) {
  const ref = useRef();

  // udpate the ref with a new query result every time the deps change
  onRendered((element) => {
    ref.value = element._root.querySelectorAll(selector);
  }, deps);

  return ref;
}

export function useTemplate(html) {
  // create the template only once with the given HTML
  return useMemoize(() => {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template;
  });
}

export function useStyle(css) {
  const [index, element] = Hooks.getContext();
  const style = element.registerHook(index, "style", () => document.createElement("style"));

  // update the style tag content when the CSS changes
  onRendered(() => {
    style.textContent = css;
  }, [css]);
}

export function useEvent(event, options) {
  const [index, element] = Hooks.getContext();

  return element.registerHook(index, "event", () => {
    // create a function that dispatches the event configured by this hook
    return function dispatchEvent(eventOptions) {
      const _event = new CustomEvent(event, { ...options, ...eventOptions });
      element.dispatchEvent(_event);
      return _event;
    };
  });
}

export function useEventListener(event, callback, deps, options) {
  // add and remove event listener when the deps change
  onRendered((element) => {
    element.addEventListener(event, callback, options);
    return () => element.removeEventListener(event, callback, options);
  }, deps);
}

export function useEventDelegation(selector, event, callback, deps, options) {
  onRendered((element) => {
    // run the callback only if the target matches the selector
    const _callback = (e) => e.target.closest?.(selector) && callback(e);

    element._root.addEventListener(event, _callback, options);
    return () => element._root.removeEventListener(event, _callback, options);
  }, deps);
}

function useLifeCycle(step, callback) {
  const [index, element] = Hooks.getContext();
  element.registerHook(index, "lifecycle", () => ({ step, callback }));
  element.setHook(index, { step, callback }); // update the callback function on every render
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

export function onRendered(sideEffect, deps) {
  const [index, element] = Hooks.getContext();
  const previous = element.registerHook(index, "lifecycle", () => ({}));

  const step = "rendered";

  function callback(...args) {
    // rerun side effect if at least one dep has changed
    if (hasChangedDeps(deps, previous.deps)) {
      previous.clearSideEffect?.();
      const clearSideEffect = sideEffect(...args);
      element.setHook(index, { step, callback, clearSideEffect, deps });
    }
  }

  element.setHook(index, { step, callback, deps: previous.deps });
}

function createHookContext() {
  let index = 0;
  let element = undefined;

  return {
    getContext: () => [
      index++, //
      element,
    ],
    setContext: (el) => {
      index = 0;
      element = el;
    },
  };
}

function render(template, root) {
  // only rerender if the template has changed
  if (root._template !== template) {
    root._template = template;
    root.append(template.content.cloneNode(true));
  }
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
