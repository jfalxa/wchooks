import { html, render } from "https://unpkg.com/lit-html";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat.js";
import { Hooked, useEffect, useMemoize, useProperties, useState } from "../wchooks.js";

function ExamplePropertyContainer() {
  const [myProp, setMyProp] = useState([1, 2, 3, 4]);

  // list memoize dependencies
  const deps = [myProp];

  // define the function that checks if the deps have changed
  const areDepsEqual = ([myProp], [oldMyProp] = []) => myProp?.length === oldMyProp?.length;

  const { addMyPropItem, removeMyPropItem } = useMemoize(
    // [!] notice that the dep array is spread as arguments of the memoize function
    (myProp) => ({
      // add (last element + 1) to the myProp list
      addMyPropItem() {
        const last = myProp[myProp.length - 1] ?? 0;
        setMyProp([...myProp, last + 1]);
      },

      // remove last element from the myProp list
      removeMyPropItem() {
        setMyProp(myProp.slice(0, -1));
      },
    }),
    deps,
    areDepsEqual
  );

  return html`
    <fieldset>
      <legend><b>useProperty / useMemoize</b></legend>
      <button id="add" @click=${addMyPropItem}>Add</button>
      <button id="remove" @click=${removeMyPropItem}>Remove</button>
      <example-property .myProp=${myProp}></example-property>
      <span>→ play with <code>window.exampleProperty.myProp</code> in the console</span>
    </fieldset>
  `;
}

function ExampleProperty() {
  // setup the "myProp" property of the custom element,
  // you'll then be able to access it directly with element.myProp
  const props = useProperties({
    myProp: [1, 2, 3, 4],
  });

  useEffect((element) => {
    window.exampleProperty = element;
  }, []);

  return html`
    <span id="list">= [${repeat(props.myProp, (value) => html`<b>${value}</b>, `)}*]</span>
  `;
}

customElements.define("example-property", Hooked(ExampleProperty, render));
customElements.define("example-property-container", Hooked(ExamplePropertyContainer, render));
