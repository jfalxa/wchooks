import { html, render } from "https://unpkg.com/lit-html";
import { Component, onRendered, useAssignedElements, useState } from "../wchooks.mjs";

function ExampleSlotContainer() {
  return html`
    <fieldset>
      <legend>
        <b>useAssignedElements</b>
      </legend>
      <example-slot>
        <span slot="title">Slotted title</span>
        <li><span class="option">option 1</span></li>
        <li><span class="option">option 2</span></li>
        <li>
          <span class="option">option 3</span>
          <span class="option">option 4</span>
        </li>
      </example-slot>
    </fieldset>
  `;
}

customElements.define("example-slot-container", Component(ExampleSlotContainer, { render }));

function ExampleSlot() {
  const [state, setState] = useState({ title: "", length: 0 });

  const titleRef = useAssignedElements({ slot: "title" }, []);
  const itemsRef = useAssignedElements({ selector: ".option" }, []);

  onRendered(() => {
    setState({
      title: titleRef.value[0].textContent,
      length: itemsRef.value.length,
    });
  }, []);

  return html`
    <b>
      <slot name="title"></slot>
    </b>

    <ul style="margin: 8px 0;">
      <slot></slot>
    </ul>

    <span>→ ${state.length} slotted options below "${state.title}"</span>
  `;
}

customElements.define("example-slot", Component(ExampleSlot, { render }));
