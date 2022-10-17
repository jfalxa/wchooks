import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref";
import { Component, onCreated, useRef } from "../wchooks.mjs";

function ExampleDOMRef() {
  // create a static reference to a dom element (or any other value)
  const inputRef = useRef();

  onCreated(() => {
    window.inputRef = inputRef;
  });

  return html`
    <fieldset>
      <legend><b>useRef</b></legend>
      <input ${ref(inputRef)} placeholder="Input with ref" style="width: 300px;" />
      <span>→ play with <code>window.inputRef</code> in the console</span>
    </fieldset>
  `;
}

customElements.define("example-dom-ref", Component(ExampleDOMRef, render));
