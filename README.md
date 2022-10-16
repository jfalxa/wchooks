# WCHOOKS

Hooks tailored for web components, inspired by https://github.com/matthewp/haunted

## Basic example

→ Check the [example app script](/docs/app.js) for a more complete demo.

```js
import { html, render } from "lit-html";
import { Component, useState, onRendered } from "wchooks";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  onRendered(() => {
    console.log("counter rendered:", counter);
  }, [counter]);

  return html`
    <div>
      <span>counter: ${counter}</span>
      <button @click=${() => setCounter(counter + 1)}>Increment</button>
    </div>
  `;
};

customElements.define("my-counter", Component(Counter, render));
```

## Component factory

The `Component` factory is the function used to build an HTMLElement that can work with hooks.

Its first argument should be a renderer function that can run hooks and returns a value that can be rendered with the `render` function passed as second argument.

This function is for example the one you get from `import { render } from "lit-html"`, it works in tandem with the `html` function also exported by `lit-html`.

The class returned by the `Component` factory is an extension of `HTMLElement` and can be used when calling `customElements.define()`.

```typescript
function Component<T>(
  renderer: () => T,
  render: (templateResult: T, root: HTMLElement) => void,
  options?: ComponentOptions
): CustomElementConstructor;
```

## List of hooks

### Data hooks

1. [useRef](#useref)
2. [useState](#usestate)
3. [useReducer](#usereducer)
4. [useMemoize](#usememoize)
5. [useMemoizeFn](#usememoizefn)
6. [useAsync](#useasync)

### HTMLElement hooks

7. [useAttribute](#useattribute)
8. [useProperty](#useproperty)
9. [useMethod](#usemethod)
10. [useEvent](#useevent)
11. [useEventListener](#useeventlistener)
12. [useStyle](#usestyle)

### Lifecycle hooks

13. [onRendered](#onrendered)
14. [onCreated](#oncreated)
15. [onConnected](#onconnected)
16. [onDisconnected](#ondisconnected)
17. [onAttributeChanged](#onattributechanged)
18. [onAdopted](#onadopted)

### Options

You also have a few other options to customize the behavior of your component:

- `observedAttributes`: List of attributes that should trigger a rerender in your component when they change
- `attachRoot`: Pick a rendering root different than the default open `shadowRoot`
- `Element`: Specify another class than HTMLElement that your component should extend

```typescript
interface ComponentOptions {
  attachRoot?: (element: HTMLElement) => Element;
  Element?: typeof HTMLElement;
  observedAttributes?: string[];
}
```

## Data hooks

### useRef

[→ See the example](/docs/components/ref.js)

Create a reference to an object that will remain at the same address for the whole life of the component. The value is then accessible through `ref.value`.

```typescript
interface Ref<T> {
  value: T;
}

function useRef<T>(initialValue?: T): Ref<T>;
```

### useState

[→ See the example](/docs/components/state.js)

Create a dynamic state that triggers a rerender when it is changed through the returned setter.

Successive synchronous calls to any setters will be batched and trigger only one update. This is also true for the setters of `useReducer`, `useAttribute` and `useProperty`.

```typescript
interface Setter<T> {
  (value: T): void;
  (value: (oldValue: T) => T): void;
}

function useState<T>(initialState: T): [T, Setter<T>];
```

### useReducer

Create a state managed by a reducer/dispatcher combo.

```typescript
interface Reducer<T, A> {
  (state: T, action: A): T;
}

interface Dispatch<A> {
  (action: A): void;
}

function useReducer<T, A>(initialState: T, reducer: Reducer<T, A>): [T, Dispatch<A>];
```

### useMemoize

[→ See the example](/docs/components/state.js)

Only recreate the value when the deps change.

The "deps" used in this hook and some other can be given in two forms:

- as an array: each item in the array will be shallow compared to its previous version to find out if the deps have changed.
- as a special object `{ deps, hasChanged: (deps, oldDeps) => boolean }`: The `hasChanged` function will be used to check if the deps are different

Providing no deps will create the value only once in the whole life of the component.

```typescript
interface DepsOptions {
  deps: any;
  hasChanged: (deps: any, oldDeps: any) => boolean;
}

type Deps = any[] | DepsOptions;

function useMemoize<T>(createValue: () => T, deps: Deps): T;
```

### useMemoizeFn

[→ See the example](/docs/components/property.js)

Only update the function scope when the deps change.

```typescript
interface Fn {
  (...args: any[]): any;
}

function useMemoizeFn<F extends Fn>(fn: F, deps: Deps): F;
```

### useAsync

[→ See the example](/docs/components/async.js)

Creates a wrapper around an async function that allows tracking the evolution of the async operation while preventing racing conditions between consecutive calls.

```typescript
type PromiseType<P> = P extends Promise<infer T> ? T : never;

interface Async<F extends AsyncFn> {
  loading: boolean;
  value: PromiseType<ReturnType<F>> | undefined;
  error: Error | undefined;
  call: F;
}

interface AsyncFn {
  (...args: any[]): Promise<any>;
}

function useAsync<F extends AsyncFn>(asyncFn: F, deps?: Deps): Async<F>;
```

## HTMLElement hooks

### useAttribute

[→ See the example](/docs/components/attribute.js)

Bind the component rendering to the given attribute and return the current value of the attribute along with a function to update it.

For the component to keep track of changes in this attribute, you should specify it inside the `observedAttributes` option of the `Component` factory.

When given the `get` option, the attribute DOM string will be parsed with it when read.

When given the `set` option, the attribute value will be stringified with it when written to the dom.

```typescript
interface AttributeOptions<T> {
  get?: (attribute: string) => T;
  set?: (value: T) => string;
}

function useAttribute<T>(attribute: string, options?: AttributeOptions<T>): [T, Setter<T>];
```

### useProperty

[→ See the example](/docs/components/property.js)

Bind the component to the given property so it rerenders when it changes.
Returns the current value of the property along with a setter.

```typescript
function useProperty<T>(property: string, defaultValue?: T): [T, Setter<T>];
```

### useMethod

[→ See the example](/docs/components/method.js)

Add a new method to the custom element object.
It is useful if you want the dom element to expose an imperative API that has access to the private parts of the component like state and refs.

Deps can be specified if the function depends on the surrounding scope.
If there are no deps, the method will only be bound once, during the element creation.

```typescript
function useMethod<F extends Fn>(method: string, fn: F, deps?: Deps): F;
```

### useEvent

[→ See the example](/docs/components/event.js)

Create an event dispatcher function that when called will dispatch the specified event with the given options.

These options can be overriden when calling the dispatcher.

```typescript
interface DispatchEvent<T> {
  (options?: CustomEventInit<T>): CustomEvent;
}

function useEvent<E extends keyof HTMLElementEventMap>(
  name: E,
  options?: EventInit
): DispatchEvent<undefined>;

function useEvent<T>(name: string, options?: CustomEventInit<T>): DispatchEvent<T>;
```

### useEventListener

[→ See the example](/docs/components/event.js)

Add an event listener bound to the current component that will attach and detach itself automatically, following the component lifecycle and deps change.

```typescript
function useEventListener<E extends keyof HTMLElementEventMap>(
  name: E,
  listener: (this: HTMLElement, event: HTMLElementEventMap[E]) => any,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener(
  name: string,
  listener: EventListenerOrEventListenerObject,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;
```

### useStyle

[→ See the example](/docs/components/style.js)

Creates a style tag containing the given CSS and adds it to the component render root.

Every time the given CSS string changes, this style tag content will also be updated.

```typescript
function useStyle(css: string): void;
```

## Life cycle hooks

For a full example of life cycle hooks, please consult the [lifecycle example script](/docs/components/lifecycle.js).

### onRendered

The callback will be called right after an update (modification of state, property, attribute, etc) is rendered to the DOM.

Every time the deps change, it will be called again.

Providing no deps will make the hook run the callback on every render.

In order to clear whatever was setup in the side effect, your callback should return a function that takes care of this clean up.

```typescript
interface LifeCycleCallbackWithClear {
  (element: HTMLElement): void | (() => void);
}

function onRendered(callback: LifeCycleCallbackWithClear, deps?: Deps): void;
```

## Life cycle hooks without clear method

These hooks are different than the previous two ones because they are directly bound to the native lifecycle of the custom element. Because of that, they have no deps and also do not give you a "clean up" feature so be careful when using them.

### onCreated

The callback will be called inside the component constructor()

```typescript
interface LifeCycleCallback {
  (element: HTMLElement): void;
}

function onCreated(createdCallback: LifeCycleCallback): void;
```

### onConnected

The callback will be called inside connectedCallback()

You can use this hook to setup listeners or api calls that should only be done once when the component appears.

```typescript
function onConnected(coonectedCallback: LifeCycleCallback): void;
```

### onDisconnected

The callback will be called inside disconnectedCallback()

Here you should imperatively clear any listener, timeout or other async operations setup in the `onConnected` hook.

```typescript
function onDisconnected(disconnectedCallback: LifeCycleCallback): void;
```

### onAttributeChanged

The callback will be called inside attributeChangedCallback(), so every time an observedAttribute changes in the DOM.

```typescript
function onAttributeChanged(
  callback: (
    element: HTMLElement,
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) => void
): void;
```

### onAdopted

The callback will be called inside adoptedCallback(), when the component changes of owner.

```typescript
function onDisconnected(disconnectedCallback: LifeCycleCallback): void;
```
