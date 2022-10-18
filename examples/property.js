import { html, render } from "https://unpkg.com/lit-html";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat.js";
import { Component, onConnected, useMemoizeFn, useProperty } from "../wchooks.mjs";

function ExampleProperty() {
  // setup the "myProp" property of the custom element,
  // you'll then be able to access it directly with element.myProp
  const [myProp, setMyProp] = useProperty("myProp", [1, 2, 3, 4]);

  // define advanced deps checking for memoizing the myProp modifier methods
  const myPropDeps = {
    deps: myProp,
    hasChanged: (myProp, oldMyProp) => myProp.length !== oldMyProp.length,
  };

  // add (last element + 1) to the myProp list
  const addMyPropItem = useMemoizeFn(() => {
    setMyProp((myProp) => {
      const last = myProp[myProp.length - 1] ?? 0;
      return [...myProp, last + 1];
    });
  }, myPropDeps);

  // remove last element from the myProp list
  const removeMyPropItem = useMemoizeFn(() => {
    setMyProp((myProp) => myProp.slice(0, -1));
  }, myPropDeps);

  onConnected((element) => {
    window.exampleProperty = element;
  });

  return html`
    <fieldset>
      <legend><b>useProperty / useMemoizeFn</b></legend>
      <button id="add" @click=${addMyPropItem}>Add</button>
      <button id="remove" @click=${removeMyPropItem}>Remove</button>
      <span id="list">= [${repeat(myProp, (value) => html`<b>${value}</b>, `)}*]</span>
      <span>→ play with <code>window.exampleProperty.myProp</code> in the console</span>
    </fieldset>
  `;
}

customElements.define("example-property", Component(ExampleProperty, { render }));
