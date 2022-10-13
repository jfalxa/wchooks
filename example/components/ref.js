import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref";
import { Component, useRef } from "../../wchooks.js";

function ExampleDOMRef() {
  // create a static reference to a dom element (or any other value)
  const inputRef = useRef();

  // @ts-ignore
  window.inputRef = inputRef;

  return html`
    <div>
      <b>DOM REF</b>
      <input ${ref(inputRef)} placeholder="Input with ref" style="width: 300px;" />
      <span>→ check window.inputRef in console</span>
    </div>
  `;
}

customElements.define("example-dom-ref", Component(ExampleDOMRef, render));
