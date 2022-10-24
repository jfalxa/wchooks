import { html, render } from "https://unpkg.com/lit-html";
import { Hooked, useAttributes, useEvent, useState } from "../wchooks.js";

function ExampleAttributeContainer() {
  const [state, setState] = useState({
    num: 0,
    str: "example",
    bool: true,
    list: [0],
  });

  return html`
    <fieldset>
      <legend><b>useAttribute</b></legend>
      <example-attribute
        num=${state.num}
        str=${state.str}
        ?bool=${state.bool}
        list=${JSON.stringify(state.list)}
        @change=${(e) => setState((state) => ({ ...state, [e.detail[0]]: e.detail[1] }))}
      ></example-attribute>
      <span>→ play with the attributes of <code>${"<example-attribute>"}</code> in the DOM</span>
    </fieldset>
  `;
}

function ExampleAttribute() {
  // control the "my-attr" attribute of the custom element (make sure to add it to observedAttributes)
  const attributes = useAttributes({
    num: 0,
    str: "",
    bool: false,
    list: [],
  });

  const dispatchChange = useEvent("change");

  return html`
    <input
      id="num"
      type="number"
      .value=${String(attributes["num"])}
      @input=${(e) => dispatchChange({ detail: ["num", e.target.value] })}
    />
    <input
      id="str"
      type="text"
      .value=${attributes["str"]}
      @input=${(e) => dispatchChange({ detail: ["str", e.target.value] })}
    />
    <input
      id="bool"
      type="checkbox"
      .checked=${attributes["bool"]}
      @change=${(e) => dispatchChange({ detail: ["bool", e.target.checked] })}
    />
    <input
      id="list"
      type="button"
      value="Append 0 to list"
      @click=${() => dispatchChange({ detail: ["list", [...attributes["list"], 0]] })}
    />
  `;
}

customElements.define(
  "example-attribute",
  Hooked(ExampleAttribute, render, { observedAttributes: ["num", "str", "bool", "list", "custom"] })
);

customElements.define("example-attribute-container", Hooked(ExampleAttributeContainer, render));
