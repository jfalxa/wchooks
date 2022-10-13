// @ts-check
import { html, render } from "https://unpkg.com/lit-html";
import { Component, onConnected, useState } from "../wchooks.js";

import "./components/attribute.js";
import "./components/event.js";
import "./components/lifecycle.js";
import "./components/property.js";
import "./components/ref.js";
import "./components/state.js";
import "./components/style.js";
import "./components/async.js";

function App() {
  const [myAttr, setMyAttr] = useState(12);
  const [myProp, setMyProp] = useState([1]);

  onConnected(() => {
    setTimeout(() => setMyAttr(102), 1000);
    setTimeout(() => setMyProp([1, 2, 3, 4]), 2000);
  });

  return html`
    <fieldset style="margin-bottom: 32px; padding: 16px;">
      <legend>${"<example-app>"}</legend>
      <example-counter></example-counter>
      <br />
      <example-event></example-event>
      <br />
      <example-attribute my-attr=${myAttr}></example-attribute>
      <br />
      <example-property .myProp=${myProp}></example-property>
      <br />
      <example-dom-ref></example-dom-ref>
      <br />
      <example-style></example-style>
      <br />
      <example-async></example-async>
      <br />
      <example-life-cycle value="0"></example-life-cycle>
    </fieldset>
  `;
}

customElements.define("example-app", Component(App, render));
