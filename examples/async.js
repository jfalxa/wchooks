import { html, render } from "https://unpkg.com/lit-html";
import { Component, useAsync } from "../wchooks.mjs";

function ExampleAsync() {
  const todos = useAsync(async ({ delay, shouldThrow }) => {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    const todos = await response.json();

    // wait the specified delay before resolving
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (shouldThrow) {
      throw new Error("Error: could not fetch todos");
    }

    return todos;
  });

  // create a string to show the number of results or the error
  const summary = todos.value
    ? `${todos.value.length} todo items found`
    : todos.error?.message ?? "∅";

  return html`
    <fieldset>
      <legend><b>useAsync</b></legend>
      <button id="call" @click=${() => todos.call({ delay: 1000 })}>Fetch data</button>
      <button id="call-error" @click=${() => todos.call({ delay: 1000, shouldThrow: true })}>
        Fetch data with error
      </button>
      <span id="result">→ ${todos.loading ? "LOADING..." : summary}</span>
    </fieldset>
  `;
}

customElements.define("example-async", Component(ExampleAsync, { render }));
