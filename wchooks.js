const HookContext = createHookContext();

export function Component(renderer, options) {
  return class HookElement extends (options.Element ?? HTMLElement) {
    static observedAttributes = options.observedAttributes;

    #root;
    #hooks = [];

    constructor() {
      super();
      this.#root = options.attachRoot?.(this) ?? this.attachShadow({ mode: "open" });
      this.render(); // dry run the renderer so we register the first hooks
      this.runLifeCycleCallbacks("created", this);
    }

    connectedCallback() {
      this.update();
      this.runLifeCycleCallbacks("connected", this);
    }

    adoptedCallback() {
      this.update();
      this.runLifeCycleCallbacks("adopted", this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.update();
      this.runLifeCycleCallbacks("attributeChanged", this, name, oldValue, newValue);
    }

    disconnectedCallback() {
      this.runLifeCycleCallbacks("disconnected", this);
      this.clearLifeCycleCallbacks("rendered");
      this.clearLifeCycleCallbacks("updated");
    }

    getHook = (index) => {
      return this.#hooks[index];
    };

    setHook = (index, data) => {
      this.#hooks[index] = data;
      return this.#hooks[index];
    };

    registerHook = (index, data) => {
      // only update the hook if it was non-existent
      if (this.#hooks[index] === undefined) {
        this.#hooks[index] = data;
      }
      return this.#hooks[index];
    };

    runLifeCycleCallbacks(step, ...args) {
      for (const hook of this.#hooks) {
        if (hook instanceof Object && step in hook) {
          const run = hook[step][0];
          run?.(...args);
        }
      }
    }

    clearLifeCycleCallbacks(step, ...args) {
      for (const hook of this.#hooks) {
        if (hook instanceof Object && step in hook) {
          const clear = hook[step][1];
          clear?.(...args);
        }
      }
    }

    render = () => {
      HookContext.setHookContext(this);
      return renderer();
    };

    update = () => {
      const templateResult = this.render();
      this.runLifeCycleCallbacks("updated", this);
      options.render(templateResult, this.#root);
      this.runLifeCycleCallbacks("rendered", this);
    };
  };
}

export function useRef(initialValue) {
  const [index, context] = HookContext.getHookContext();
  return context.registerHook(index, { value: initialValue });
}

export function useConstant(createConstant) {
  const ref = useRef();
  if (ref.value === undefined) ref.value = createConstant();
  return ref.value;
}

export function useMemoize(createValue, deps) {
  const [index, context] = HookContext.getHookContext();
  const [oldValue, oldDeps] = context.getHook(index) ?? [createValue()];

  if (hasChangedDeps(deps, oldDeps)) {
    context.setHook(index, [createValue(), deps]);
  }

  // register hook and extract the actual value from current hook cache
  return context.registerHook(index, [oldValue, oldDeps])[0];
}

export function useMemoizeFn(fn, deps) {
  return useMemoize(() => fn, deps);
}

export function useReducer(initialState, reducer) {
  const [index, context] = HookContext.getHookContext();

  function dispatch(action) {
    const [oldState, _dispatch] = context.getHook(index);
    const state = reducer(oldState, action);
    context.setHook(index, [state, _dispatch]);
    context.update();
  }

  return context.registerHook(index, [initialState, dispatch]);
}

export function useState(initialState) {
  return useReducer(initialState, (oldState, state) => resolveData(state, oldState));
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

function useLifeCycle(step, sideEffect) {
  const [index, context] = HookContext.getHookContext();
  context.setHook(index, { [step]: [sideEffect] });
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

export function onCreated(createdCallback) {
  useLifeCycle("created", createdCallback);
}

export function onConnected(connectedCallback) {
  useLifeCycle("connected", connectedCallback);
}

export function onAdopted(adoptedCallback) {
  useLifeCycle("adopted", adoptedCallback);
}

export function onAttributeChanged(attributeChangedCallback) {
  useLifeCycle("attributeChanged", attributeChangedCallback);
}

export function onUpdated(updatedCallback, deps) {
  useLifeCycleWithDeps("updated", updatedCallback, deps);
}

export function onRendered(renderedCallback, deps) {
  useLifeCycleWithDeps("rendered", renderedCallback, deps);
}

export function onDisconnected(disconnectedCallback) {
  useLifeCycle("disconnected", disconnectedCallback);
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
      element.update();
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
