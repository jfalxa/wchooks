import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref.js";
import { Hooked, onRendered, useRef } from "../wchooks.js";

function ExampleDOMRef() {
  // create a static reference to a dom element (or any other value)
  const inputRef = useRef();

  onRendered(() => {
    window.inputRef = inputRef;
  }, []);

  return html`
    <fieldset>
      <legend><b>useRef</b></legend>
      <input ${ref(inputRef)} placeholder="Input with ref" style="width: 300px;" />
      <span>→ play with <code>window.inputRef</code> in the console</span>
    </fieldset>
  `;
}

customElements.define("example-dom-ref", Hooked(ExampleDOMRef, render));
