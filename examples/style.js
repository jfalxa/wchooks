import { html, render } from "https://unpkg.com/lit-html";
import { Component, useState, useStyle } from "../wchooks.mjs";

function ExampleStyle() {
  const [size, setSize] = useState("16");

  useStyle(`
    .text {
      font-weight: bold;
      font-size: ${size}px;
    }
  `);

  return html`
    <fieldset>
      <legend><b>useStyle</b></legend>

      <label>Set text size:</label>
      <input
        placeholder="Text size"
        type="number"
        size="2"
        .value=${String(size)}
        @input=${(e) => setSize(e.target.value)}
      />

      <span class="text" style="margin-left: 8px">Text with dynamic size</span>
      <span>→ check the style tag in this element</span>
    </fieldset>
  `;
}

customElements.define("example-style", Component(ExampleStyle, { render }));
