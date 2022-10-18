import { html, render } from "https://unpkg.com/lit-html";
import {
  onConnected,
  onDisconnected,
  onRendered,
  Component,
  useMethod,
  useState,
} from "../wchooks.mjs";

function ExampleLifeCycle() {
  const [_, update] = useState();

  // grab the onLifeCycle callback passed directly as property
  const onLifeCycle = useMethod("onLifeCycle");

  // add a callback to be run during connectedCallback
  onConnected((element) => {
    onLifeCycle("onConnected", element);
  });

  // add a callback to be run when the element is removed
  onDisconnected((element) => {
    onLifeCycle("onDisconnected", element);
  });

  // add a callback to be run just after the update has been rendered to the dom
  onRendered((element) => {
    onLifeCycle("onRendered", element);
    return () => onLifeCycle("onRendered (cleared)", element);
  });

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <fieldset>
      <legend>
        <b>onConnected / onDisconnected / onAttributeChanged / onRendered</b>
      </legend>
      <button id="update" @click=${() => update()}>Update</button>
      <button id="remove" @click=${(e) => removeHostFromDocument(e.target)}>
        Remove this block from document
      </button>
      <span>→ check lifecycle callbacks in the dev-tools</span>
      <example-nested-life-cycle .onLifeCycle=${onLifeCycle}></example-nested-life-cycle>
    </fieldset>
  `;
}

customElements.define(
  "example-life-cycle",
  Component(ExampleLifeCycle, { render, observedAttributes: ["value"] })
);

function ExampleNestedLifeCycle() {
  const onLifeCycle = useMethod("onLifeCycle");

  // add a callback to be run during connectedCallback
  onConnected((element) => {
    onLifeCycle("onConnected", element);
  });

  // add a callback to be run when the element is removed
  onDisconnected((element) => {
    onLifeCycle("onDisconnected", element);
  });

  // add a callback to be run just after the update has been rendered to the dom
  onRendered((element) => {
    onLifeCycle("onRendered", element);
    return () => onLifeCycle("onRendered (cleared)", element);
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
  Component(ExampleNestedLifeCycle, { render, observedAttributes: ["value"] })
);
