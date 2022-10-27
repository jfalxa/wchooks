import { html, render } from "https://unpkg.com/lit-html";
import { withHooks, useEvents, useState, useEffect } from "../wchooks.js";

function ExampleEvent() {
  const [counter, setCounter] = useState(0);

  // create a function that dispatches the "myevent" event
  const events = useEvents({
    myevent: { detail: 0 }, // we set the default value of the event detail to 0 in case it's not specified
  });

  // add a listener that reacts to the "myevent" event
  useEffect((element) => {
    const increment = (e) => setCounter((counter) => counter + e.detail); // we grab the detail from the event to increment
    element.addEventListener("myevent", increment);
    return () => element.removeEventListener("myevent", increment);
  }, []);

  return html`
    <fieldset>
      <legend>
        <b>useEvents</b>
      </legend>
      <button id="dispatch" @click=${() => events.myevent(1)}>Dispatch custom event</button>
      <span>→ <b id="counter">${counter}</b> events dispatched</span>
    </fieldset>
  `;
}

customElements.define("example-event", withHooks(ExampleEvent, render));
