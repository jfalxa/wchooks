import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref.js";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat.js";
import { withHooks, useEffect, useMemoize, useProperties, useRef, useState } from "../wchooks.js";

function ExamplePropertyContainer() {
  const childRef = useRef();

  const [myProp, setMyProp] = useState([1, 2, 3, 4]);

  // list memoize dependencies
  const deps = [myProp];

  // define the function that checks if the deps have changed
  const areDepsEqual = ([myProp], [oldMyProp] = []) => myProp?.length === oldMyProp?.length;

  // create a pair of function to modify myProp, and update them recreate them every time myProp changes
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

  function resetMyPropFromParent() {
    childRef.value?.resetMyProp();
  }

  return html`
    <fieldset>
      <legend><b>useProperty / useMemoize</b></legend>
      <button id="add" @click=${addMyPropItem}>Add</button>
      <button id="remove" @click=${removeMyPropItem}>Remove</button>
      <button id="reset" @click=${resetMyPropFromParent}>Reset child from parent</button>
      <example-property
        ${ref(childRef)}
        .myProp=${myProp}
        .onChange=${(myProp) => setMyProp(myProp)}
      ></example-property>
      <span>→ play with <code>window.exampleProperty.myProp</code> in the console</span>
    </fieldset>
  `;
}

function ExampleProperty() {
  const props = useProperties({
    // setup the "myProp" property of the custom element, you'll then be able to access it directly with element.myProp
    // this is a default value, in this example the actual value will be controlled by the parent component above
    myProp: [],

    // default value for a callback method that will be passed by the parent
    onChange() {},

    // define a method bound to the element
    resetMyProp() {
      // inside methods, you can directly access the element with `this`
      this.myProp = [];
      this.onChange(this.myProp);
    },
  });

  useEffect((element) => {
    window.exampleProperty = element;
  }, []);

  return html`
    <span id="list">= [${repeat(props.myProp, (value) => html`<b>${value}</b>, `)}*]</span>
    <button id="reset" @click=${props.resetMyProp}>Reset child</button>
  `;
}

customElements.define("example-property", withHooks(ExampleProperty, render));
customElements.define("example-property-container", withHooks(ExamplePropertyContainer, render));
