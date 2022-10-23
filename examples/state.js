import { html, render } from "https://unpkg.com/lit-html";
import { useMemoize, useState, Hooked } from "../wchooks.mjs";

function ExampleState() {
  // create a dynamic state that rerenders the element when changed
  const [counter, setCounter] = useState(0);

  // update this variable with the current date only when the counter has just changed
  const counterTimes5 = useMemoize(() => counter * 5, [counter]);

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
      <button id="increment" @click=${increment}>+3</button>
      <button id="decrement" @click=${decrement}>-1</button>
      <span>= <b id="counter">${counter}</b> <i id="multiplier">(x5 = ${counterTimes5})</i></span>
    </fieldset>
  `;
}

customElements.define("example-state", Hooked(ExampleState, render));
