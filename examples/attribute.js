import { html, render } from "https://unpkg.com/lit-html";
import { Hooked, useAttributes } from "../wchooks.mjs";

function ExampleAttribute() {
  // control the "my-attr" attribute of the custom element (make sure to add it to observedAttributes)
  const [attributes, setAttributes] = useAttributes({
    "my-num": 0,
    "my-str": "example",
    "my-bool": true,
    "my-list": [0],

    "my-custom": () => ({
      defaultValue: 1,
      get: (attribute) => parseInt(attribute.replace("key-", ""), 10),
      set: (value) => `key-${value}`,
    }),
  });

  return html`
    <fieldset>
      <legend><b>useAttribute</b></legend>
      <input
        id="num"
        type="number"
        .value=${String(attributes["my-num"])}
        @input=${(e) => setAttributes({ "my-num": e.target.value })}
      />
      <input
        id="str"
        type="text"
        .value=${attributes["my-str"]}
        @input=${(e) => setAttributes({ "my-str": e.target.value })}
      />
      <input
        id="bool"
        type="checkbox"
        .checked=${attributes["my-bool"]}
        @change=${(e) => setAttributes({ "my-bool": e.target.checked })}
      />
      <input
        id="list"
        type="button"
        value="Append 0 to list"
        @click=${() => setAttributes({ "my-list": [...attributes["my-list"], 0] })}
      />
      <input
        id="custom"
        .value=${String(attributes["my-custom"])}
        @input=${(e) => setAttributes({ "my-custom": e.target.value })}
      />
      <span>→ play with the attributes of <code>${"<example-attribute>"}</code> in the DOM</span>
    </fieldset>
  `;
}

const observedAttributes = ["my-num", "my-str", "my-bool", "my-list", "my-custom"];

customElements.define(
  "example-attribute",
  Hooked(ExampleAttribute, render, { observedAttributes })
);
