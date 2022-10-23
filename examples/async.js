import { html, render } from "https://unpkg.com/lit-html";
import { Hooked, useAsync } from "../wchooks.mjs";

async function fetchData({ delay, shouldThrow }) {
  // fake waiting the specified delay before resolving
  await new Promise((resolve) => setTimeout(resolve, delay));

  // fake an error if the flag is on
  if (shouldThrow) throw new Error("Error: could not fetch todos");

  // return an array of 200 `1`
  return new Array(200).fill(1);
}

function ExampleAsync() {
  const todos = useAsync(fetchData);

  // create a string to show the number of results or the error
  const summary = todos.value
    ? `${todos.value.length} todo items found`
    : todos.error?.message ?? "∅";

  return html`
    <fieldset>
      <legend><b>useAsync</b></legend>
      <button id="call" @click=${() => todos.call({ delay: 500 })}>Fetch data</button>
      <button id="call-error" @click=${() => todos.call({ delay: 500, shouldThrow: true })}>
        Fetch data with error
      </button>
      <span id="result">→ ${todos.loading ? "LOADING..." : summary}</span>
    </fieldset>
  `;
}

customElements.define("example-async", Hooked(ExampleAsync, render));
