// @ts-check
import { html, render } from "https://unpkg.com/lit-html";
import { ref } from "https://unpkg.com/lit-html/directives/ref";
import { repeat } from "https://unpkg.com/lit-html/directives/repeat";

import {
  onCreated,
  onAttributeChanged,
  onUpdated,
  onRendered,
  onConnected,
  onDisconnected,
  useAttribute,
  useProperty,
  useRef,
  useState,
  useReducer, // @todo example
  useEvent,
  useEventListener,
  useMemoize,
  useMemoizeFn,
  Component,
} from "../wchooks.js";

function App() {
  const [myAttr, setMyAttr] = useState(12);
  const [myProp, setMyProp] = useState([1]);

  onConnected(() => {
    setTimeout(() => setMyAttr(102), 1000);
    setTimeout(() => setMyProp([1, 2, 3, 4]), 2000);
  });

  return html`
    <fieldset style="margin-bottom: 32px; padding: 16px;">
      <legend>${"<example-app>"}</legend>
      <example-counter></example-counter>
      <br />
      <example-event></example-event>
      <br />
      <example-attribute my-attr=${myAttr}></example-attribute>
      <br />
      <example-property .myProp=${myProp}></example-property>
      <br />
      <example-dom-ref></example-dom-ref>
      <br />
      <example-life-cycle value="0"></example-life-cycle>
    </fieldset>
  `;
}

customElements.define("example-app", Component(App, { render }));

//---------//
// COUNTER //
//---------//

function ExampleCounter() {
  // create a dynamic state that rerenders the element when changed
  const [counter, setCounter] = useState(0);

  // update this variable with the current date only when the counter has just changed
  const lastChanged = useMemoize(() => new Date().toLocaleString(), [counter]);

  // add a callback to be run just after an update to the counter state
  onUpdated(
    (element) => {
      const dom = element.shadowRoot?.getElementById("counter")?.innerText;
      console.log(`after update: counter = ${counter}, dom = ${dom}`);
    },
    [counter]
  );

  // add a callback to be run just after the counter state has been rendered in the dom
  onRendered(
    (element) => {
      const dom = element.shadowRoot?.getElementById("counter")?.innerText;
      console.log(`after render: counter = ${counter}, dom = ${dom} `);
    },
    [counter]
  );

  return html`
    <div>
      <b>COUNTER </b>
      <button @click=${() => setCounter(counter + 1)}>+</button>
      <button @click=${() => setCounter(counter - 1)}>-</button>
      <span>= <span id="counter">${counter}</span> (last changed: ${lastChanged})</span>
    </div>
  `;
}

customElements.define("example-counter", Component(ExampleCounter, { render }));

//-------//
// EVENT //
//-------//

function ExampleEvent() {
  // create a function that dispatches the "custom-event" event
  const dispatchEvent = useEvent("custom-event", { bubbles: true });

  // add a listener that reacts to the "custom-event" event
  useEventListener("custom-event", (e) => {
    console.log(`Event "custom-event"`, e);
  }); // can also have deps to avoid listener add/remove on every render

  return html`
    <div>
      <b>EVENT</b>
      <button @click=${() => dispatchEvent()}>Dispatch custom event</button>
      <span>→ check console for event logs</span>
    </div>
  `;
}

customElements.define("example-event", Component(ExampleEvent, { render }));

//-----------//
// ATTRIBUTE //
//-----------//

function ExampleAttribute() {
  // control the "my-attr" attribute of the custom element (make sure to add it to observedAttributes)
  const [myAttr, setMyAttr] = useAttribute("my-attr", { get: Number });

  // // add a callback to be run during attributeChangedCallback
  onAttributeChanged((element, name, oldValue, newValue) => {
    if (name === "my-attr") {
      console.log("changed attribute:", element, { name, oldValue, newValue });
    }
  });

  return html`
    <div>
      <b>ATTRIBUTE "my-attr"</b>
      <input type="number" value=${myAttr} @input=${(e) => setMyAttr(e.target.value)} />
      <span>→ check dom to see the new attribute value</span>
    </div>
  `;
}

customElements.define(
  "example-attribute",
  Component(ExampleAttribute, { render, observedAttributes: ["my-attr"] })
);

//----------//
// PROPERTY //
//----------//

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
    <div>
      <b>PROPERTY "myProp"</b>
      <button @click=${addMyPropItem}>+</button>
      <button @click=${removeMyPropItem}>-</button>
      <span>= [${repeat(myProp, (value) => html`<b>${value}</b>, `)}*]</span>
      <span>→ check window.appElement.myProp in console</span>
    </div>
  `;
}

customElements.define("example-property", Component(ExampleProperty, { render }));

//---------//
// DOM REF //
//---------//

function ExampleDOMRef() {
  // create a static reference to a dom element (or any other value)
  const inputRef = useRef();

  // @ts-ignore
  window.inputRef = inputRef;

  return html`
    <div>
      <b>DOM REF</b>
      <input ${ref(inputRef)} placeholder="Input with ref" style="width: 300px;" />
      <span>→ check window.inputRef in console</span>
    </div>
  `;
}

customElements.define("example-dom-ref", Component(ExampleDOMRef, { render }));

//-----------//
// LIFECYCLE //
//-----------//

function ExampleLifeCycle() {
  // add a callback to be run during the constructor call
  onCreated((element) => {
    console.log(element, "[Created]");
  });

  onAttributeChanged((element, name, oldValue, newValue) => {
    console.log(element, "[AttributeChanged]", { name, oldValue, newValue });
  });

  // add a callback to be run just after an update, before rendering
  onUpdated((element) => {
    console.log(element, "[Updated]");
    return () => console.log(element, "[Updated: clear previous]");
  });

  // add a callback to be run just after the update has been rendered to the dom
  onRendered((element) => {
    console.log(element, "[Rendered]");
    return () => console.log(element, "[Rendered: clear previous]");
  });

  // add a callback to be run during connectedCallback
  onConnected((element) => {
    console.log(element, "[Connected]");
  });

  // add a callback to be run when the element is removed
  onDisconnected((element) => {
    console.log(element, "[Disconnected]");
  });

  // add click event listener to window to check that it's correctly removed when the element is unmounted
  onRendered(() => {
    const handleClick = () => console.log("window click");
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  });

  function removeHostFromDocument(target) {
    target.getRootNode().host?.remove();
  }

  return html`
    <div>
      <b>LIFECYCLE</b>
      <button @click=${(e) => removeHostFromDocument(e.target)}>
        ✕ Remove this line from document
      </button>
      <span>→ check console for disconnected callback</span>
    </div>
  `;
}

customElements.define(
  "example-life-cycle",
  Component(ExampleLifeCycle, { render, observedAttributes: ["value"] })
);
