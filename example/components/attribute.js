import { html, render } from "https://unpkg.com/lit-html";
import { Component, onAttributeChanged, useAttribute } from "../../wchooks.js";

function ExampleAttribute() {
  // control the "my-attr" attribute of the custom element (make sure to add it to observedAttributes)
  const [myAttr, setMyAttr] = useAttribute("my-attr", { get: Number });

  // // add a callback to be run during attributeChangedCallback
  onAttributeChanged((element, name, oldValue, newValue) => {
    if (name === "my-attr") {
      console.log("[ATTRIBUTE] changed attribute:", element, { name, oldValue, newValue });
    }
  });

  return html`
    <div>
      <b>ATTRIBUTE "my-attr"</b>
      <input type="number" value=${myAttr} @input=${(e) => setMyAttr(e.target.value)} />
      <span>→ check dom to see the new attribute value</span>
    </div>
  `;
}

customElements.define(
  "example-attribute",
  Component(ExampleAttribute, render, { observedAttributes: ["my-attr"] })
);
