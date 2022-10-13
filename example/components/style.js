import { html, render } from "https://unpkg.com/lit-html";
import { Component, onConnected, useState, useStyle } from "../../wchooks.js";

function ExampleStyle() {
  const [size, setSize] = useState(16);

  useStyle(`
    .title {
      font-weight: bold;
      font-size: ${size}px;
    }
  `);

  // set the font size to 32px after 1s
  onConnected(() => {
    setTimeout(() => {
      setSize(32);
    }, 1000);
  });

  return html`
    <div>
      <b>STYLE</b>
      <span class="title">Styled title (size: ${size}px)</span>
    </div>
  `;
}

customElements.define("example-style", Component(ExampleStyle, render));
