# WCHOOKS

![](https://badgen.net/npm/v/wchooks)
![](https://badgen.net/npm/types/wchooks)
![](https://badgen.net/bundlephobia/minzip/wchooks)

Hooks tailored for web components, inspired by https://github.com/matthewp/haunted

## Description

The core idea is similar to [React's hooks](https://reactjs.org/docs/hooks-intro.html) so you will feel at home if you're already familiar with them.

How it departs from React is that those hooks are built with [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) in mind so, while trying to remain as small as possible, they also try to abstract the most common operations that are needed to build a usable custom element.

Note that there are some constraints on how you can use hooks, for more information you can read the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) of React.

## Usage

This library being published on npm, you can:
- `npm install wchooks` if you are using a bundler
- import the module from a CDN, e.g. `import { useState } from "https://unpkg.com/wchooks"`


## Basic example

A counter with a button to increment its value:

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

customElements.define("my-counter", Component(Counter, { render }));
```

## Component factory

The `Component` factory is the function used to build a custom `HTMLElement` that can work with hooks.

Its first argument should be a renderer function that runs hooks and returns a value that can be rendered with the `render` function passed in the options.

If no `render` option is specified, `wchooks` will expect your renderers to return directly an `HTMLTemplateElement` and it will automatically put their content in the DOM, replacing the previous content if the template has changed.

The class returned by the `Component` factory is an extension of `HTMLElement` and can be used when calling `customElements.define()`.

```typescript
function Component<T>(
  renderer: () => T,
  render: (templateResult: T, root: HTMLElement) => void,
  options?: ComponentOptions
): CustomElementConstructor;
```

### Options

You also have a few other options to customize the behavior of your component:

- `render`: This function applies the templates returned by your renderers to the DOM, this is e.g. `import { render } from "lit-html"`
- `observedAttributes`: List of attributes that should trigger a rerender in your component when they change
- `attachRoot`: Pick a rendering root different than the default open `shadowRoot`
- `Element`: Specify another class than HTMLElement that your component should extend

```typescript
interface ComponentOptions {
  render?: (templateResult: T, root: HTMLElement) => void;
  attachRoot?: (element: HTMLElement) => Element;
  Element?: typeof HTMLElement;
  observedAttributes?: string[];
}
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
12. [useEventDelegation](#useeventlistener)
13. [useStyle](#usestyle)
14. [useTemplate](#usetemplate)
15. [useQuerySelector](#usequeryselector)
16. [useQuerySelectorAll](#usequeryselectorall)

### Lifecycle hooks

17. [onRendered](#onrendered)
18. [onCreated](#oncreated)
19. [onConnected](#onconnected)
20. [onDisconnected](#ondisconnected)
21. [onAttributeChanged](#onattributechanged)
22. [onAdopted](#onadopted)

## Data hooks

### useRef

[→ See the example](/examples/ref.js)

Create a reference to an object that will remain at the same address for the whole life of the component. The value is then accessible through `ref.value`.

```typescript
interface Ref<T> {
  value: T;
}

function useRef<T>(initialValue?: T): Ref<T>;
```

### useState

[→ See the example](/examples/state.js)

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

[→ See the example](/examples/state.js)

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

[→ See the example](/examples/property.js)

Only update the function scope when the deps change.

```typescript
interface Fn {
  (...args: any[]): any;
}

function useMemoizeFn<F extends Fn>(fn: F, deps: Deps): F;
```

### useAsync

[→ See the example](/examples/async.js)

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

[→ See the example](/examples/attribute.js)

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

[→ See the example](/examples/property.js)

Bind the component to the given property so it rerenders when it changes.
Returns the current value of the property along with a setter.

```typescript
function useProperty<T>(property: string, defaultValue?: T): [T, Setter<T>];
```

### useMethod

[→ See the example](/examples/method.js)

Add a new method to the custom element object.
It is useful if you want the dom element to expose an imperative API that has access to the private parts of the component like state and refs.

Deps can be specified if the function depends on the surrounding scope.
If there are no deps, the method will only be bound once, during the element creation.

```typescript
function useMethod<F extends Fn>(method: string, fn: F, deps?: Deps): F;
```

### useEvent

[→ See the example](/examples/event.js)

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

[→ See the example](/examples/event.js)

Add an event listener bound to the current component that will attach and detach itself automatically, following the component lifecycle and deps change.

```typescript
function useEventListener<E extends keyof HTMLElementEventMap>(
  event: E,
  listener: (this: HTMLElement, event: HTMLElementEventMap[E]) => any,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener(
  event: string,
  listener: EventListenerOrEventListenerObject,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;
```

### useEventDelegation

[→ See the example](/examples/template.js)

Similar to [useEventListener](#useeventlistener) except the callback will only run when the actual event target matches the given selector.
This allows you to define event listeners on elements that are nested inside the render root of your component.

```typescript
function useEventDelegation<E extends keyof HTMLElementEventMap>(
  selector: string,
  event: E,
  listener: (this: HTMLElement, event: HTMLElementEventMap[E]) => any,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;

function useEventDelegation(
  selector: string,
  event: string,
  listener: EventListenerOrEventListenerObject,
  deps?: Deps,
  options?: boolean | AddEventListenerOptions
): void;
```

### useStyle

[→ See the example](/examples/style.js)

Creates a style tag containing the given CSS and adds it to the component render root.

Every time the given CSS string changes, this style tag content will also be updated.

```typescript
function useStyle(css: string): void;
```

### useTemplate

[→ See the example](/examples/template.js)

Creates a static template holding the given HTML.

If you are not using a custom `render` function in your `Component` factory, in your renderer you can directly return the `HTMLTemplateElement` created by this hook and `wchooks` will automatically add the template content at the root of your component.

The template is only created once and cannot be updated, so there is no point in updating the HTML string passed as argument.

If you want to interact with the generated DOM, you will have to go through other hooks like [`useQuerySelector`](#usequeryselector) and [`useEventDelegation`](#useeventdelegation), which can get quite verbose.

This hook only covers a very basic use case, so for rendering HTML it is recommended to use libs like [`lit-html`](https://lit.dev/docs/v1/lit-html/introduction/), it will give you a way smoother development experience.

```typescript
function useTemplate(html: string): HTMLTemplateElement;
```

### useQuerySelector

[→ See the example](/examples/template.js)

Queries the component render root for the given selector and returns the first result in a ref.
If no deps are passed, the query will be done on every render.

```typescript
function useQuerySelector<E extends Element>(selector: string, deps?: Deps): Ref<E | null>;
```

### useQuerySelectorAll

Queries the component render root for the given selector and returns the list of results in a ref.
If no deps are passed, the query will be done on every render.

```typescript
function useQuerySelectorAll<E extends Element>(selector: string, deps?: Deps): Ref<NodeListOf<E>>;
```

## Life cycle hooks

For a full example of life cycle hooks, please consult the [lifecycle example script](/examples/lifecycle.js).

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
