import { html, render } from "https://unpkg.com/lit-html";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat";
import { Component, useMemoizeFn, useProperty } from "../../wchooks.mjs";

function ExampleProperty() {
  // setup the "myProp" property of the custom element,
  // you'll then be able to access it directly with element.myProp
  const [myProp, setMyProp] = useProperty("myProp");

  // define advanced deps checking for memoizing the myProp modifier methods
  const myPropDeps = {
    deps: myProp,
    hasChanged: (myProp, oldMyProp) => myProp.length !== oldMyProp.length,
  };

  // add (last element + 1) to the myProp list
  const addMyPropItem = useMemoizeFn(() => {
    const last = myProp[myProp.length - 1] ?? 0;
    setMyProp([...myProp, last + 1]);
  }, myPropDeps);

  // remove last element from the myProp list
  const removeMyPropItem = useMemoizeFn(() => {
    setMyProp(myProp.slice(0, -1));
  }, myPropDeps);

  return html`
    <fieldset>
      <legend><b>useProperty / useMemoizeFn</b></legend>
      <button @click=${addMyPropItem}>Add</button>
      <button @click=${removeMyPropItem}>Remove</button>
      <span>= [${repeat(myProp, (value) => html`<b>${value}</b>, `)}*]</span>
      <span>→ check window.appElement.myProp in console</span>
    </fieldset>
  `;
}

customElements.define("example-property", Component(ExampleProperty, render));
