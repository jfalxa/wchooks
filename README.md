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
import { Hooked, useState, onUpdated } from "wchooks";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  onUpdated(() => {
    console.log("counter rendered:", counter);
  }, [counter]);

  return html`
    <div>
      <span>counter: ${counter}</span>
      <button @click=${() => setCounter(counter + 1)}>Increment</button>
    </div>
  `;
};

customElements.define("my-counter", Hooked(Counter, render));
```

## Hooked factory

The `Hooked` factory is the function used to build a custom `HTMLElement` that can work with hooks.

Its first argument should be a renderer function that runs hooks and returns a value that can be rendered with the `render` function passed as second argument.

This `render` function applies the templates returned by your renderers to the DOM, this is e.g. `import { render } from "lit-html"`.

The class returned by the `Hooked` factory is an extension of `HTMLElement` and can be used when calling `customElements.define()`.

```typescript
function Hooked<T>(
  renderer: () => T,
  render: (templateResult: T, root: ParentNode) => void,
  options?: HookedOptions
): CustomElementConstructor;
```

### Options

You also have a few other options to customize the behavior of your component:

- `observedAttributes`: List of attributes that should trigger a rerender in your component when they change
- `attachRoot`: Pick a rendering root different than the default open `shadowRoot`
- `Element`: Specify another class than HTMLElement that your component should extend

```typescript
interface HookedOptions {
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
5. [useAsync](#useasync)

### HTMLElement hooks

6. [useAttributes](#useattributes)
7. [useProperties](#useproperties)
8. [useEvent](#useevent)

### Lifecycle hooks

9. [onUpdated](#onupdated)

## Data hooks

### useRef

[→ See the example](/examples/ref.js)

Create a reference to an object that will remain at the same address for the whole life of the component. The value is then accessible through `ref.value`.

```typescript
interface Ref<T> {
  value: T;
}

function useRef<T>(initialValue: T): Ref<T>;
```

### useState

[→ See the example](/examples/state.js)

Create a dynamic state that triggers a rerender when it is changed through the returned setter.

Successive synchronous calls to any setters will be batched and trigger only one update. This is also true for the setters of `useReducer`, `useAttributes` and `useProperties`.

```typescript
interface Setter<T> {
  (value: T): void;
  (value: (oldValue: T) => T): void;
}

function useState<T>(initialState: T): [T, Setter<T>];
```

### useReducer

[→ See the example](/examples/reducer.js)

Create a state managed by a reducer that returns the current value and a dispatch function to update it.

When called, the dispatch function will run the reducer with the current state and the argument given to dispatch. The value returned by the reducer will be the new state.

The passed `initialState` can be a function. In that case, it will receive 2 arguments `(dispatch, getState)`. This allows you to define methods inside your state that can read and write this same state.

```typescript
interface Reducer<T, A> {
  (state: T, action: A): T;
}

interface Dispatch<A> {
  (action: A): void;
}

interface CreateState<T, A> {
  (dispatch: Dispatch<A>, getState: () => T) => T
}

function useReducer<T, A>(createState: T | CreateState<T>, reducer: Reducer<T, A>): [T, Dispatch<A>];
```

### useMemoize

[→ See the example (1)](/examples/state.js)

[→ See the example (2)](/examples/property.js)

Only recreate the value when the deps change.

If no deps are specified, the value will be created only once and won't ever change.

The array of deps is otherwise spread as arguments of the callback function. This allows to define your callback function outside the scope of your component, so you can enforce a clear list of deps for this function.

You can also specify a custom `isEqual` function as last argument that will compare new deps with old deps to confirm that they have changed.

```typescript
interface IsEqual<D extends any[]> {
  (deps: D | undefined, oldDeps: D | undefined) => boolean
}

function useMemoize<T, D extends any[]>(createValue: (...deps: D) => T, deps?: D, isEqual?: IsEqual<D>): T;
```

### useAsync

[→ See the example](/examples/async.js)

Creates a wrapper around an async function that allows tracking the evolution of the async operation while preventing racing conditions between consecutive calls.

```typescript
interface Async<F extends AsyncFn> {
  loading: boolean;
  value: PromiseType<F> | undefined; // PromiseType = type of the promise returned by the async function
  error: Error | undefined;
  call: F;
}

interface AsyncFn {
  (...args: any[]): Promise<any>;
}

function useAsync<F extends AsyncFn>(asyncFn: F): Async<F>;
```

## HTMLElement hooks

### useAttributes

[→ See the example](/examples/attribute.js)

Bind many attributes to a component.

For these attributes to trigger an update when they change, they should be added to the component `observedAttributes`.

The attributes default values passed as argument will be used to guess the kind of parsing/serialization needed to interact with the attribute in the DOM.

For example, if we have `{ "my-flag": true }`, the attribute will be shown as `"my-flag"=""` in the DOM.
If we have `{ "my-flag": false }`, the attribute will be removed.

You can also customize the parsing/serialization by passing a function as default value. This function should return an object with 3 keys:

- `defaultValue`: the initial value for this attribute
- `get`: a function that parses the attribute DOM string into the wanted value
- `set`: a function that serializes a value into a string to be written in the DOM

```typescript
// The Attributes type flattens the list of default values to get the actual types that will be parsed from the DOM.

function useAttributes<A extends { [name: string]: any }>(
  initialAttributes: A
): [Attributes<A>, (values: Attributes<Partial<A>>) => void];
```

### useProperties

[→ See the example (value)](/examples/property.js)

[→ See the example (method)](/examples/method.js)

Bind a list of properties to the current element.

The properties are initialized with the given default value.
Then, any time they'll be modified, it will trigger an update.

These properties become accessible directly on the DOM element, wether they are values or functions. This allows you to build an API to control your component private state from the outside.

```typescript
function useProperties<P extends { [name: string]: any }>(
  properties: P
): [P, (values: Partial<P>) => void];
```

### useEvent

[→ See the example](/examples/event.js)

Create an event dispatcher function that when called will dispatch the specified event with the given options.

These options can be overriden when calling the dispatcher.

```typescript
interface DispatchEvent<T> {
  (options?: CustomEventInit<T>): CustomEvent;
}

function useEvent<T>(event: string, options?: CustomEventInit<T>): DispatchEvent<T>;
```

## Life cycle hooks

[→ See the example](/examples/lifecycle.js)

### onUpdated

This hook will run a callback right after an update (modification of state, property, attribute, etc) has been rendered to the DOM.

Every time the deps change, it will be called again. Providing no deps will make the hook run the callback on every render.

In order to clear whatever was setup in the side effect, your callback should return a function that takes care of this clean up.

When the `onUpdated` hook is invoked, the current deps will be spread as the arguments of the callback function, along with a reference to the element the hook is bound to.

For this reason, when your effect has too many dependencies, it is recommended to define your callback function outside the scope of the component, this will limit the amount of bugs coming from stale closure.

```typescript
type LifeCycleCallback<D extends any[]> = (element: HTMLElement, ...deps: D) => void | (() => void);

function onUpdated<D extends any[]>(updatedCallback: LifeCycleCallback<D>, deps?: D): void;
```
