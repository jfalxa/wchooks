import {
  Component,
  onRendered,
  useEventDelegation,
  useQuerySelector,
  useState,
  useTemplate,
} from "../wchooks.mjs";

function ExampleTemplate() {
  const [value, setValue] = useState("");

  // the template is static, changes to this HTML code will be ignored
  // if you want to manipulate its content, you will have to go through operations like the ones below
  const template = useTemplate(`
    <fieldset>
      <legend><b>useTemplate / useQuerySelector / useEventDelegation</b></legend>
      <input id="input" />
      <span>→ check the input in the DOM
    </fieldset>
  `);

  // update the value when the input changes
  useEventDelegation("#input", "input", (e) => setValue(e.target.value));

  // get a ref to the input
  const inputRef = useQuerySelector("#input");

  // update the value of the input when the state changes
  onRendered(() => {
    const input = inputRef.value;

    input.value = value;
    input.setAttribute("value", value);
  }, [value]);

  return template;
}

customElements.define("example-template", Component(ExampleTemplate));
