import { html, render } from "https://unpkg.com/lit-html";
import { Component } from "../wchooks.mjs";

import "./attribute.js";
import "./event.js";
import "./lifecycle.js";
import "./property.js";
import "./ref.js";
import "./state.js";
import "./style.js";
import "./async.js";
import "./method.js";
import "./template.js";

function ExampleApp() {
  return html`
    <h1>Examples of wchooks components</h1>

    <p>→ You can read the source code directly inside your browser's dev-tools.</p>

    <section style="display: flex; flex-direction: column; gap: 24px;">
      <example-counter></example-counter>
      <example-event></example-event>
      <example-attribute></example-attribute>
      <example-property></example-property>
      <example-dom-ref></example-dom-ref>
      <example-style></example-style>
      <example-async></example-async>
      <example-method-container></example-method-container>
      <example-template></example-template>
      <example-life-cycle value="0"></example-life-cycle>
    </section>
  `;
}

customElements.define("example-app", Component(ExampleApp, { render }));