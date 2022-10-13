import { html, render } from "https://unpkg.com/lit-html";
import {
  onAttributeChanged,
  onConnected,
  onCreated,
  onDisconnected,
  onRendered,
  onUpdated,
  Component,
} from "../../wchooks.js";

function ExampleLifeCycle() {
  // add a callback to be run during the constructor call
  onCreated((element) => {
    console.log("[LIFECYCLE] Created", element);
  });

  onAttributeChanged((element, name, oldValue, newValue) => {
    console.log("[LIFECYCLE] AttributeChanged", { name, oldValue, newValue }, element);
  });

  // add a callback to be run just after an update, before rendering
  onUpdated((element) => {
    console.log("[LIFECYCLE] Updated", element);
    return () => console.log("[LIFECYCLE] Updated clear previous", element);
  });

  // add a callback to be run just after the update has been rendered to the dom
  onRendered((element) => {
    console.log("[LIFECYCLE] Rendered", element);
    return () => console.log("[LIFECYCLE] Rendered clear previous", element);
  });

  // add a callback to be run during connectedCallback
  onConnected((element) => {
    console.log("[LIFECYCLE] Connected", element);
  });

  // add a callback to be run when the element is removed
  onDisconnected((element) => {
    console.log("[LIFECYCLE] Disconnected", element);
  });

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <div>
      <b>LIFECYCLE</b>
      <button @click=${(e) => removeHostFromDocument(e.target)}>
        ✕ Remove this block from document
      </button>
      <example-nested-life-cycle></example-nested-life-cycle>
      <span>→ check console for lifecycle callbacks</span>
    </div>
  `;
}

customElements.define(
  "example-life-cycle",
  Component(ExampleLifeCycle, { render, observedAttributes: ["value"] })
);

function ExampleNestedLifeCycle() {
  // add a callback to be run during the constructor call
  onCreated((element) => {
    console.log("[LIFECYCLE NESTED] Created", element);
  });

  onAttributeChanged((element, name, oldValue, newValue) => {
    console.log("[LIFECYCLE NESTED] AttributeChanged", { name, oldValue, newValue }, element);
  });

  // add a callback to be run just after an update, before rendering
  onUpdated((element) => {
    console.log("[LIFECYCLE NESTED] Updated", element);
    return () => console.log("[LIFECYCLE NESTED] Updated: clear previous", element);
  });

  // add a callback to be run just after the update has been rendered to the dom
  onRendered((element) => {
    console.log("[LIFECYCLE NESTED] Rendered", element);
    return () => console.log("[LIFECYCLE NESTED] Rendered: clear previous", element);
  });

  // add a callback to be run during connectedCallback
  onConnected((element) => {
    console.log("[LIFECYCLE NESTED] Connected", element);
  });

  // add a callback to be run when the element is removed
  onDisconnected((element) => {
    console.log("[LIFECYCLE NESTED] Disconnected", element);
  });

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <button @click=${(e) => removeHostFromDocument(e.target)}>
      ✕ Remove this nested button from its parent
    </button>
  `;
}

customElements.define(
  "example-nested-life-cycle",
  Component(ExampleNestedLifeCycle, { render, observedAttributes: ["value"] })
);
