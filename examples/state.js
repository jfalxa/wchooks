import { html, render } from "https://unpkg.com/lit-html";
import { useMemoize, onRendered, useState, Component } from "../wchooks.mjs";

function ExampleState() {
  // create a dynamic state that rerenders the element when changed
  const [counter, setCounter] = useState(0);

  // update this variable with the current date only when the counter has just changed
  const counterTimes5 = useMemoize(() => counter * 5, [counter]);

  // add a callback to be run just after the counter state has been rendered in the dom
  onRendered(
    (element) => {
      const dom = element.shadowRoot?.getElementById("counter")?.innerText;
      console.log(`[STATE] after render: counter = ${counter}`);
    },
    [counter]
  );

  function increment() {
    setCounter((counter) => counter + 1);
    setCounter((counter) => counter + 1);
    setCounter((counter) => counter + 1);
  }

  function decrement() {
    setCounter((counter) => counter - 1);
  }

  return html`
    <fieldset>
      <legend><b>useState / useMemoize</b></legend>
      <button @click=${increment}>+3</button>
      <button @click=${decrement}>-1</button>
      <span>= <span id="counter">${counter}</span> (x5 = ${counterTimes5})</span>
    </fieldset>
  `;
}

customElements.define("example-counter", Component(ExampleState, render));
