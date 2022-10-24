import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref.js";
import { useEvent } from "../wchooks.js";
import { Hooked, useRef, useState, useProperties, useEffect } from "../wchooks.js";

function ExampleMethodContainer() {
  const methodRef = useRef();

  const [active, setActive] = useState(false);

  function toggleCheckboxFromOutside() {
    methodRef.value.toggleCheckbox(); // access the property directly on the dom element
  }

  return html`
    <fieldset>
      <legend><b>useProperty (for methods)</b></legend>
      <button @click=${toggleCheckboxFromOutside}>
        Toggle checkbox from outside <i id="checked">(checked=${active})</i>
      </button>
      <span>→ try <code>window.exampleMethod.toggleCheckbox()</code> in the console</span>
      <example-method ${ref(methodRef)} @change=${(e) => setActive(e.detail)}></example-method>
    </fieldset>
  `;
}

function ExampleMethod() {
  const [active, setActive] = useState(false);
  const dispatchChange = useEvent("change");

  const props = useProperties({
    // the method is bound to the element under the specified name
    // and it is also returned here so we can access it in the rendering scope
    toggleCheckbox(forceActive) {
      setActive((active) => {
        const _active = forceActive ?? !active;
        dispatchChange({ detail: _active });
        return _active;
      });
    },
  });

  useEffect((element) => {
    window.exampleMethod = element;
  }, []);

  return html`
    <fieldset style="margin-top: 8px">
      <legend>child component with exposed method</legend>
      <button @click=${() => props.toggleCheckbox()}>Toggle checkbox</button>
      <input
        type="checkbox"
        .checked=${active}
        @change=${(e) => props.toggleCheckbox(e.target.checked)}
      />
      <span id="toggle">${active ? "ON" : "OFF"}</span>
    </fieldset>
  `;
}

customElements.define("example-method", Hooked(ExampleMethod, render));
customElements.define("example-method-container", Hooked(ExampleMethodContainer, render));
