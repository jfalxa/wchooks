import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref.js";
import { Component, useMethod, useRef, useState, onConnected } from "../wchooks.mjs";

function ExampleMethodContainer() {
  const methodRef = useRef();

  const [active, setActive] = useState(false);

  function toggleCheckboxFromOutside() {
    methodRef.value.toggleCheckbox(); // access the property directly on the dom element
  }

  return html`
    <fieldset>
      <legend><b>useMethod</b></legend>
      <button @click=${toggleCheckboxFromOutside}>
        Toggle checkbox from outside <i id="checked">(checked=${active})</i>
      </button>
      <span>→ try <code>window.exampleMethod.toggleCheckbox()</code> in the console</span>
      <example-method ${ref(methodRef)} .onChange=${(active) => setActive(active)}></example-method>
    </fieldset>
  `;
}

customElements.define("example-method-container", Component(ExampleMethodContainer, { render }));

function ExampleMethod() {
  const [active, setActive] = useState(false);

  // grab the .onChange property added to this element by its parent
  const onChange = useMethod("onChange");

  // the method is bound to the element under the specified name
  // and it is also returned so we can access it in the rendering scope
  const toggleCheckbox = useMethod(
    "toggleCheckbox",
    (forceActive) => {
      const newActive = forceActive ?? !active;
      setActive(newActive);
      onChange?.(newActive);
    },
    [active]
  );

  onConnected((element) => {
    window.exampleMethod = element;
  });

  return html`
    <fieldset style="margin-top: 8px">
      <legend>child component with exposed method</legend>
      <button @click=${() => toggleCheckbox()}>Toggle checkbox</button>
      <input
        type="checkbox"
        .checked=${active}
        @change=${(e) => toggleCheckbox(e.target.checked)}
      />
      <span id="toggle">${active ? "ON" : "OFF"}</span>
    </fieldset>
  `;
}

customElements.define("example-method", Component(ExampleMethod, { render }));
