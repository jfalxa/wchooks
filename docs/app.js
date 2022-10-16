import { html, render } from "https://unpkg.com/lit-html";
import { Component, onConnected, useState, useStyle } from "../wchooks.mjs";

import "./components/attribute.js";
import "./components/event.js";
import "./components/lifecycle.js";
import "./components/property.js";
import "./components/ref.js";
import "./components/state.js";
import "./components/style.js";
import "./components/async.js";
import "./components/method.js";

function ExampleApp() {
  const [myAttr, setMyAttr] = useState(12);
  const [myProp, setMyProp] = useState([1]);

  onConnected(() => {
    setTimeout(() => setMyAttr(102), 1000);
    setTimeout(() => setMyProp([1, 2, 3, 4]), 2000);
  });

  return html`
    <h1>Examples of wchooks components</h1>

    <p>→ You can read the source code directly inside your browser's dev-tools.</p>

    <section style="display: flex; flex-direction: column; gap: 24px;">
      <example-counter></example-counter>
      <example-event></example-event>
      <example-attribute my-attr=${myAttr}></example-attribute>
      <example-property .myProp=${myProp}></example-property>
      <example-dom-ref></example-dom-ref>
      <example-style></example-style>
      <example-async></example-async>
      <example-method-container></example-method-container>
      <example-life-cycle value="0"></example-life-cycle>
    </section>
  `;
}

customElements.define("example-app", Component(ExampleApp, render));
