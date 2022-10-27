import { html, render } from "https://unpkg.com/lit-html";
import { withHooks, useEvents, useState, useEffect } from "../wchooks.js";

function ExampleEvent() {
  const [counter, setCounter] = useState(0);

  // create a function that dispatches the "myevent" event
  const events = useEvents({ myevent: { bubbles: true } });

  // add a listener that reacts to the "myevent" event
  useEffect((element) => {
    const increment = () => setCounter((counter) => counter + 1);
    element.addEventListener("myevent", increment);
    return () => element.removeEventListener("myevent", increment);
  }, []);

  return html`
    <fieldset>
      <legend>
        <b>useEvents</b>
      </legend>
      <button id="dispatch" @click=${() => events.myevent({ detail: new Date() })}>
        Dispatch custom event
      </button>
      <span>→ <b id="counter">${counter}</b> events dispatched</span>
    </fieldset>
  `;
}

customElements.define("example-event", withHooks(ExampleEvent, render));
