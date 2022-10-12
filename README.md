# WCHOOKS

Hooks tailored for web components, inspired by https://github.com/matthewp/haunted

## Basic example

→ Check the [example app script](/example/app.js) for a more complete demo.

```js
import { html, render } from "lit-html"
import { useState, onRendered } from "wchooks"

const Counter = () => {
  const [counter, setCounter] = useState(0)

  onRendered(() => {
    console.log('counter rendered:', counter)
  }, [counter])

  return html`
    <div>
      <span>counter: ${counter}</span>
      <button @click=${() => setCounter(counter + 1)}>Increment</button>
    </div>
  `
}

customElements.define("my-counter", Component(Counter, { render }));
```


## Component function options

- `render: Function`: required, the function used to render the value returned by your renderer function;
- `observedAttributes?: string[]`: List of attributes that should trigger a rerender in your component when they change;
- `attachRoot?: (element: HTMLElement) => Element`: Pick a rendering root different than the default open `shadowRoot`;
- `Element?: typeof HTMLElement`: Specify another class than HTMLElement that your component should extend;
}


## Available hooks

### HTMLElement life cycle hooks

- `onCreated(callback: (element: HTMLElement) => void)`: The callback will be called inside the component constructor()
- `onAttributeChanged(callback: (element: HTMLElement, name: string, oldValue: string, newValue: string) => void)`:  The callback will be called inside attributeChangedCallback()
- `onConnected(callback: (element: HTMLElement) => void)`: The callback will be called inside connectedCallback()
- `onDisconnected(callback: (element: HTMLElement) => void)`: The callback will be called inside disconnectedCallback()


### HTMLElement hooks

- `useAttribute<T>(name: string: { get?, set? }): [T, Setter<T>]`: Bind the component to the given attribute + optionally parse it with options.get and stringify with options.set

- `useProperty<T>(name: string, defaultValue?: T): [T, Setter<T>]`: Bind the component to the given property so it rerenders when it changes
- `useRef<T>(value?: T): Ref<T>`: Create a reference to an object that will remain at the same address for the whole life of the component. The value is then accessible through `ref.value`
- `useEvent(name: string, options?: CustomEventInit): DispatchEvent`: Create an event dispatcher function that when called will dispatch the specified event with the given options (overridable during the call)
- `useEventListener(name: string, listener: EventListener, deps?: Deps, options?: EventListenerOptions): void`: Add an event listener bound to the current component


### Data life cycle hooks

- `onUpdated(callback: (element: HTMLElement) => void, deps: Deps)`: The callback will be called after an update, but before it's applied to the DOM
- `onRendered(callback: (element: HTMLElement) => void, deps: Deps)`: The callback will be called after an update is finally rendered to the DOM


### Data management hooks

- `useConstant<T>(createValue?: () => T): T`: Create a ref that will be initialized only once and never change after
- `useState<T>(initialState: T): [T, Setter<T>]`: Create a dynamic state that triggers a rerender when it is changed through the returned setter.
- `useReducer<T, A>(initialState: T, reducer: (state: T, action: A) => T): [T, Dispatch<A>]`: Create a state managed by a reducer/dispatcher combo
- `useMemoize<T>(createValue: () => T, deps: Deps): T`: Only recreate the value when the deps change
- `useMemoizeFn<T>(fn: T, deps: Deps): T`: Only recreate the function when the deps change


### Deps

The "deps" used in some of the hooks can be given in two forms:
- as an array: each item in the array will be shallow compared to its previous version to find out if the deps have changed.
- as a special object `{ deps: any, hasChanged: (deps: any, oldDeps: any) => boolean }`: The `hasChanged` function will be used to check if the deps are different