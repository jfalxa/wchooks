# WCHOOKS

![](https://badgen.net/npm/v/wchooks)
![](https://badgen.net/npm/types/wchooks)
![](https://badgen.net/bundlephobia/minzip/wchooks)

React-like Hooks tailored for Web Components, inspired by https://github.com/matthewp/haunted

## Description

The core idea is similar to [React's hooks](https://reactjs.org/docs/hooks-intro.html) so you will feel at home if you're already familiar with them.

The library has been made with three objectives in mind:
- provide hooks that improve the developer experience of building web components
- remain as small as possible without sacrificing code readability
- try to address problems inherent to react-like hooks, notably dependency tracking hell

## Usage

This library being published on npm, you can:

- `npm install wchooks` if you are using a bundler
- import the module from a CDN, e.g. `import { useState } from "https://unpkg.com/wchooks"`

In your project you will also have to import a library like [`lit-html`](https://lit.dev/docs/v1/lit-html/introduction/) because `wchooks` is designed to offload the actual DOM rendering to these external libraries, as they already do a perfect job.

## Basic example

A counter with a button to increment its value:

```js
import { html, render } from "lit-html";
import { withHooks, useState, useEffect } from "wchooks";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    console.log("counter rendered:", counter);
  }, [counter]);

  return html`
    <div>
      <span>counter: ${counter}</span>
      <button @click=${() => setCounter(counter + 1)}>Increment</button>
    </div>
  `;
};

customElements.define("my-counter", withHooks(Counter, render));
```

## API reference

### Factory

- [withHooks factory](#withHooks-factory)
- [Options](#options)

### Data hooks

- [useRef](#useref)
- [useState](#usestate)
- [useReducer](#usereducer)
- [useAsync](#useasync)

### HTMLElement hooks

- [useAttributes](#useattributes)
- [useProperties](#useproperties)
- [useEvents](#useevents)

### Dependency hooks

- [Note on dependencies](#note-on-dependencies)
- [useMemoize](#usememoize)
- [useEffect](#useEffect)

## withHooks factory

The `withHooks` factory is the function used to build a custom `HTMLElement` that can work with hooks.

Its first argument should be a renderer function that runs hooks and returns a value that can be rendered with the `render` function passed as second argument.

This `render` function applies the templates returned by your renderers to the DOM, this is e.g. `import { render } from "lit-html"`.

The class returned by the `withHooks` factory is an extension of `HTMLElement` and can be used when calling `customElements.define()`.

```typescript
function withHooks<T>(
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

Successive synchronous calls to any setters will be batched and trigger only one update. This is also true for the setters of `useReducer`.

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

Specify a list of default values for the element's attributes and return their current actual value.

For these attributes to trigger an update when they change, they should be added to the component `observedAttributes`.

The attributes default values passed as argument will be used to guess the kind of parsing/serialization needed to interact with the attribute in the DOM.

For example, if we have `{ "my-flag": true }`, the attribute will be shown as `"my-flag"=""` in the DOM.
If we have `{ "my-flag": false }`, the attribute will be removed.

```typescript
function useAttributes<A extends { [name: string]: any }>(initialAttributes: A): A;
```

### useProperties

[→ See the example](/examples/property.js)

Specify a list of default values for the element's properties and return their current actual value.

The properties are initialized with the given default value.
Then, any time they'll be modified, it will trigger an update.

These properties become accessible directly on the DOM element, wether they are values or functions. This allows you to build an API to control your component private state from the outside.

If your property is defined as a function, it will automatically be bound to the withHooks element. That way you can access the component inside the method with `this`. Note that this won't work if you define your property as an arrow function, as they cannot be rebound.

```typescript
function useProperties<P extends { [name: string]: any }>(properties: P): P;
```

### useEvents

[→ See the example](/examples/event.js)

Create event dispatchers for the given events with their default options.

These options can still be overriden when calling the dispatchers.

```typescript
interface DispatchEvent<T> {
  (options?: CustomEventInit<T>): CustomEvent;
}

function useEvents<E extends string>(events: { [event in E]: CustomEventInit<any>; }): { [event in E]: DispatchEvent<any>; }
```

## Dependency hooks

### Note on dependencies

This library tries to address the dependency tracking issues of React's hooks by offering only two hooks that you should go to whenever you want something to change along with your states.

As opposed to React, the callbacks for these hooks are registered only during the first render, so any following rerender will not affect the values in their closure. This means that you cannot directly use values coming from e.g. `useState` or `useProperties` inside your callback function as every time it'll be called, these values will remain the same they were the first time the component was rendered, even if the state or property has actually changed in the meantime.

> Note: exceptions to this are refs from `useRef`, the setter function of `useState` and the dispatch function of `useReducer`, as they all remain exactly the same throughout the life of your component. The same goes for any other static references coming from outside your component.

So if you want to actually make your hooks aware of their surrounding, you can give them a list of dependencies as second argument. Then, when a hook callback will be called, all those deps will be spread as its arguments. This mitigates stale dependency bugs by forcing you to create a clear scope in which your hook should work. It results in a more verbose code than React's, but maybe it's for the best.

Hooks with deps also accept a custom `isEqual` function as third argument. It will be used when comparing new deps with old deps to confirm that they have changed.

### useMemoize

[→ See the example (1)](/examples/state.js)

[→ See the example (2)](/examples/property.js)

Only recreate the value when the deps change.

If no deps are specified, the value will be created only once and won't ever change.
Otherwise, the array of deps is spread as arguments of the callback function.

```typescript
interface IsEqual<D extends any[]> {
  (deps: D | undefined, oldDeps: D | undefined) => boolean
}

function useMemoize<T, D extends any[]>(createValue: (...deps: D) => T, deps?: D, isEqual?: IsEqual<D>): T;
```

### useEffect

[→ See the example](/examples/lifecycle.js)

This hook will run a callback right after an update (modification of state, property, attribute, etc) has been rendered to the DOM.

Every time the deps change, it will be called again. But providing no deps at all will make the hook run the callback on every render.

In order to clear whatever was setup in the side effect, your callback should return a function that takes care of this clean up.

When the `useEffect` hook is invoked, the current deps will be spread as the arguments of the callback function, along with a reference to the element the hook is bound to.

```typescript
type EffectCallback<D extends any[]> = (element: HTMLElement, ...deps: D) => void | (() => void);

function useEffect<D extends any[]>(
  effectCallback: EffectCallback<D>,
  deps?: D,
  isEqual?: IsEqual<D>
): void;
```
