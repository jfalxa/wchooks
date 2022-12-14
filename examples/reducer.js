import { html, render } from "https://unpkg.com/lit-html";
import { useReducer, withHooks } from "../wchooks.js";

function ExampleReducer() {
  // advanced state initializer for a counter
  function createCounter(dispatch, getState) {
    return {
      total: 0,

      add(value) {
        const state = getState();
        const _ = state.total + value; // this is just to show that you can also access the current state if neededd
        dispatch({ add: value });
      },

      sub(value) {
        dispatch({ sub: value });
      },
    };
  }

  const counterReducer = (state, action) => {
    if ("add" in action) {
      return { ...state, total: state.total + action.add };
    }

    if ("sub" in action) {
      return { ...state, total: state.total - action.sub };
    }

    return state;
  };

  const [counter] = useReducer(createCounter, counterReducer);

  return html`
    <fieldset>
      <legend><b>useReducer</b></legend>
      <button id="add" @click=${() => counter.add(2)}>+2</button>
      <button id="sub" @click=${() => counter.sub(2)}>-2</button>
      <span>= <b id="counter">${counter.total}</b></span>
    </fieldset>
  `;
}

customElements.define("example-reducer", withHooks(ExampleReducer, render));
