import { html, render } from "https://unpkg.com/lit-html";
import {
  onAttributeChanged,
  onConnected,
  onCreated,
  onDisconnected,
  onRendered,
  Component,
} from "../../wchooks.mjs";

function ExampleLifeCycle() {
  // add a callback to be run during the constructor call
  onCreated((element) => {
    console.log("[LIFECYCLE] Created", element);
  });

  onAttributeChanged((element, name, oldValue, newValue) => {
    console.log("[LIFECYCLE] AttributeChanged", { name, oldValue, newValue }, element);
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
    <fieldset>
      <legend><b>Lifecycle callbacks</b></legend>
      <button @click=${(e) => removeHostFromDocument(e.target)}>
        Remove this block from document
      </button>
      <span>→ check console for lifecycle callbacks</span>
      <example-nested-life-cycle></example-nested-life-cycle>
    </fieldset>
  `;
}

customElements.define(
  "example-life-cycle",
  Component(ExampleLifeCycle, render, { observedAttributes: ["value"] })
);

function ExampleNestedLifeCycle() {
  // add a callback to be run during the constructor call
  onCreated((element) => {
    console.log("[LIFECYCLE NESTED] Created", element);
  });

  onAttributeChanged((element, name, oldValue, newValue) => {
    console.log("[LIFECYCLE NESTED] AttributeChanged", { name, oldValue, newValue }, element);
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
    <fieldset style="margin-top: 8px">
      <legend>nested element</legend>
      <button @click=${(e) => removeHostFromDocument(e.target)}>
        Remove this element from its parent
      </button>
      <span>→ compare the lifecycle order with the parent</span>
    </fieldset>
  `;
}

customElements.define(
  "example-nested-life-cycle",
  Component(ExampleNestedLifeCycle, render, { observedAttributes: ["value"] })
);
