import { html, render } from "https://unpkg.com/lit-html";
import { Component, useEvent, useEventListener, useState } from "../wchooks.mjs";

function ExampleEvent() {
  const [counter, setCounter] = useState(0);

  // create a function that dispatches the "custom-event" event
  const dispatchEvent = useEvent("custom-event", { bubbles: true });

  // add a listener that reacts to the "custom-event" event
  useEventListener("custom-event", () => setCounter((counter) => counter + 1), []);

  return html`
    <fieldset>
      <legend>
        <b>useEvent / useEventListener</b>
      </legend>
      <button id="dispatch" @click=${() => dispatchEvent({ detail: new Date() })}>
        Dispatch custom event
      </button>
      <span>→ <b id="counter">${counter}</b> events dispatched</span>
    </fieldset>
  `;
}

customElements.define("example-event", Component(ExampleEvent, { render }));
