import { html, render } from "https://unpkg.com/lit-html";
import { Hooked, useEvent, useState, onRendered } from "../wchooks.mjs";

function ExampleEvent() {
  const [counter, setCounter] = useState(0);

  // create a function that dispatches the "custom-event" event
  const dispatchEvent = useEvent("myevent", { bubbles: true });

  // add a listener that reacts to the "custom-event" event
  onRendered((element) => {
    const increment = () => setCounter((counter) => counter + 1);
    element.addEventListener("myevent", increment);
    return () => element.removeEventListener("myevent", increment);
  }, []);

  return html`
    <fieldset>
      <legend>
        <b>useEvent</b>
      </legend>
      <button id="dispatch" @click=${() => dispatchEvent({ detail: new Date() })}>
        Dispatch custom event
      </button>
      <span>→ <b id="counter">${counter}</b> events dispatched</span>
    </fieldset>
  `;
}

customElements.define("example-event", Hooked(ExampleEvent, render));
