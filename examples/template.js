import {
  Component,
  onConnected,
  onRendered,
  useEventDelegation,
  useQuerySelector,
  useQuerySelectorAll,
  useState,
  useTemplate,
} from "../wchooks.mjs";

function ExampleTemplate() {
  const [selection, setSelection] = useState(undefined);

  // templates are static, so changes to the HTML code will be ignored
  // if you want to manipulate the DOM, you will have to go through operations like the ones below
  const template = useTemplate(`
    <fieldset>
      <legend><b>useTemplate / useQuerySelector / useEventDelegation</b></legend>
      <span>Selected value =</span> <b id="value"></b>
      <ul id="list" style="margin: 8px 0;"></ul>
      <span>→ check the radios in the DOM
    </fieldset>
  `);

  // prepare a template to render list items
  const listItemTemplate = useTemplate(`
    <li class="listItem">
      <label>
        <input type="radio" class="radio" />
        <span class="label"></span>
      <label>
    </li>
  `);

  // get refs to rendered elements
  const valueRef = useQuerySelector("#value");
  const listRef = useQuerySelector("#list");
  const listItems = useQuerySelectorAll(".listItem");

  // listen to changes in the radio buttons to update the state
  useEventDelegation("input.radio", "change", (e) => {
    setSelection(e.target.value);
  });

  // during the first render, append some items to the list
  onRendered(() => {
    const items = ["a", "b", "c"];

    // create list items and configure their content
    items.forEach((item) => {
      const listItem = listItemTemplate.content.cloneNode(true);

      const label = listItem.querySelector(".label");
      label.textContent = `choice ${item}`;

      const radio = listItem.querySelector(".radio");
      radio.value = item;

      listRef.value.append(listItem);
    });
  }, []);

  // when the selection state changes, update the label and the list items radios
  onRendered(() => {
    // update the label with the new value
    valueRef.value.textContent = selection ?? "∅";

    // update the radios so only one is selected
    for (const item of listItems.value) {
      const radio = item.querySelector(".radio");

      const isChecked = radio.value === selection;

      radio.checked = isChecked;
      if (isChecked) radio.setAttribute("checked", "");
      else radio.removeAttribute("checked");
    }
  }, [selection]);

  // return the component content template
  return template;
}

customElements.define("example-template", Component(ExampleTemplate));
