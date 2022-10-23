import { html, render } from "https://unpkg.com/lit-html";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat.js";
import { Hooked } from "../wchooks.js";

import "./async.js";
import "./attribute.js";
import "./event.js";
import "./lifecycle.js";
import "./method.js";
import "./property.js";
import "./ref.js";
import "./state.js";
import "./reducer.js";

function ExampleApp() {
  function logLifeCycle(step, element) {
    console.log("[lifecycle]", element, step);
  }

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
      <example-dom-ref></example-dom-ref>
      <example-state></example-state>
      <example-reducer></example-reducer>
      <example-async></example-async>
      <example-event></example-event>
      <example-attribute></example-attribute>
      <example-property></example-property>
      <example-method-container></example-method-container>
      <example-life-cycle .onLifeCycle=${logLifeCycle}></example-life-cycle>
    </section>
  `;
}

customElements.define("example-app", Hooked(ExampleApp, render));
