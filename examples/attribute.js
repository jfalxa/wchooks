import { html, render } from "https://unpkg.com/lit-html";
import { Component, useAttribute } from "../wchooks.mjs";

function ExampleAttribute() {
  // control the "my-attr" attribute of the custom element (make sure to add it to observedAttributes)
  const [myAttr, setMyAttr] = useAttribute("my-attr");

  return html`
    <fieldset>
      <legend><b>useAttribute</b></legend>
      <input type="number" .value=${myAttr} @input=${(e) => setMyAttr(e.target.value)} />
      <span
        >→ play with the <code>"my-attr"</code> attribute of
        <code>${"<example-attribute>"}</code> in the DOM</span
      >
    </fieldset>
  `;
}

customElements.define(
  "example-attribute",
  Component(ExampleAttribute, { render, observedAttributes: ["my-attr"] })
);
