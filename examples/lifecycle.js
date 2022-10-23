import { html, render } from "https://unpkg.com/lit-html";
import { Hooked, useProperties, useReducer, onUpdated } from "../wchooks.js";

function ExampleLifeCycle() {
  const [count, add] = useReducer(1, (count, increment) => count + increment);

  const [props] = useProperties({ onLifeCycle: undefined });

  // add a callback to be run just after the update to count has been rendered to the dom
  onUpdated(
    // [!] the current DOM element is _always_ passed as first argument
    // [!] notice that the dep array is spread as the last arguments of the lifecycle callback function
    (element, count) => {
      props.onLifeCycle(`onUpdated ${count}.`, element);
      return () => props.onLifeCycle(`onUpdated ${count}. (cleared)`, element);
    },
    [count]
  );

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <fieldset>
      <legend>
        <b>onUpdated</b>
      </legend>
      <button id="update" @click=${() => add(1)}>Force update</button>
      <button id="remove" @click=${(e) => removeHostFromDocument(e.target)}>
        Remove this block from document
      </button>
      <span>→ check lifecycle callbacks in the console</span>
      <example-nested-life-cycle
        .count=${count}
        .onLifeCycle=${props.onLifeCycle}
      ></example-nested-life-cycle>
    </fieldset>
  `;
}

function ExampleNestedLifeCycle() {
  const [props] = useProperties({ count: 0, onLifeCycle: undefined });

  onUpdated(
    (element, count) => {
      props.onLifeCycle(`onUpdated ${count}.`, element);
      return () => props.onLifeCycle(`onUpdated ${count}. (cleared)`, element);
    },
    [props.count]
  );

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <fieldset style="margin-top: 8px">
      <legend>nested element</legend>
      <button @click=${(e) => removeHostFromDocument(e.target)}>
        Remove this element from its parent
      </button>
      <span>→ compare the lifecycle order with the parent</span>
    </fieldset>
  `;
}

customElements.define("example-life-cycle", Hooked(ExampleLifeCycle, render));
customElements.define("example-nested-life-cycle", Hooked(ExampleNestedLifeCycle, render));
