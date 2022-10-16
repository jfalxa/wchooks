import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref";
import { Component, useRef, useMethod, useState } from "https://unpkg.com/wchooks?module";

function ExampleMethodContainer() {
  const methodRef = useRef();

  function toggleCheckboxFromOutside() {
    methodRef.value.toggleCheckbox(); // access the property directly on the dom element
  }

  return html`
    <div>
      <b>METHOD</b>
      <button @click=${toggleCheckboxFromOutside}>Toggle checkbox from outside</button>

      <fieldset style="margin-top: 8px">
        <legend>child component with exposed method</legend>
        <example-method ${ref(methodRef)}></example-method>
      </fieldset>
    </div>
  `;
}

customElements.define("example-method-container", Component(ExampleMethodContainer, render));

function ExampleMethod() {
  const [active, setActive] = useState(false);

  // the method is bound to the element under the specified name
  // and it is also returned so we can also access it in the rendering context
  const toggleCheckbox = useMethod("toggleCheckbox", () => setActive((active) => !active)); // can also have deps in case the used scope changes

  return html`
    <button @click=${toggleCheckbox}>Toggle checkbox</button>
    <input type="checkbox" ?checked=${active} />
    ${active ? "ON" : "OFF"}
  `;
}

customElements.define("example-method", Component(ExampleMethod, render));
