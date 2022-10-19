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
import "./slot.js";

function ExampleApp() {
  return html`
    <h1>Examples of wchooks components</h1>

    <p>
      <b>Documentation</b> →
      <a href="https://github.com/jfalxa/wchooks" target="_blank">
        https://github.com/jfalxa/wchooks
      </a>
    </p>

    <p>
      → You can read the source code directly inside your browser's dev-tools and play around with
      the debugger.
    </p>

    <section style="display: flex; flex-direction: column; gap: 24px;">
      <example-state></example-state>
      <example-event></example-event>
      <example-attribute></example-attribute>
      <example-property></example-property>
      <example-dom-ref></example-dom-ref>
      <example-style></example-style>
      <example-async></example-async>
      <example-method-container></example-method-container>
      <example-template></example-template>
      <example-slot-container></example-slot-container>
      <example-life-cycle .onLifeCycle=${() => {}}></example-life-cycle>
    </section>
  `;
}

customElements.define("example-app", Component(ExampleApp, { render }));
