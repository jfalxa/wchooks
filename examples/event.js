import { html, render } from "https://unpkg.com/lit-html";
import { withHooks, useEvents, useState } from "../wchooks.js";

function ExampleEventContainer() {
  const [counter, setCounter] = useState(0);

  return html`
    <fieldset>
      <legend>
        <b>useEvents</b>
      </legend>
      <example-event @myevent=${(e) => setCounter((counter) => counter + e.detail)}></example-event>
      <span>→ <b id="counter">${counter}</b> events dispatched</span>
    </fieldset>
  `;
}

function ExampleEvent() {
  // create a function that dispatches the "myevent" event
  const events = useEvents({
    myevent: { detail: 0 }, // we set the default value of the event detail to 0 in case it's not specified
  });

  return html`
    <button id="dispatch" @click=${() => events.myevent(1)}>Dispatch custom event</button>
  `;
}

customElements.define("example-event-container", withHooks(ExampleEventContainer, render));
customElements.define("example-event", withHooks(ExampleEvent, render));
