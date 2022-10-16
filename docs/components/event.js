import { html, render } from "https://unpkg.com/lit-html";
import { Component, useEvent, useEventListener } from "../../wchooks.mjs";

function ExampleEvent() {
  // create a function that dispatches the "custom-event" event
  const dispatchEvent = useEvent("custom-event", { bubbles: true });

  // add a listener that reacts to the "custom-event" event
  useEventListener("custom-event", (e) => {
    console.log(`[EVENT] "custom-event"`, e);
  }); // can also have deps to avoid listener add/remove on every render

  return html`
    <fieldset>
      <legend>
        <b>useEvent / useEventListener</b>
      </legend>
      <button @click=${() => dispatchEvent()}>Dispatch custom event</button>
      <span>→ check console for event logs</span>
    </fieldset>
  `;
}

customElements.define("example-event", Component(ExampleEvent, render));
