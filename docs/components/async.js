import { html, render } from "https://unpkg.com/lit-html";
import { Component, useAsync } from "https://unpkg.com/wchooks";

function ExampleAsync() {
  const todos = useAsync(async ({ delay }) => {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    const todos = await response.json();

    // wait the specified delay before resolving
    await new Promise((resolve) => setTimeout(resolve, delay));

    // throw new Error("Something happened."); // toggle comment to check error mode

    return todos;
  });

  // create a string to show the number of results or the error
  const summary = todos.value
    ? `${todos.value.length} todo items found`
    : todos.error?.message ?? "∅";

  return html`
    <div>
      <b>ASYNC</b>

      <button @click=${() => todos.call({ delay: 1000 })}>Fetch some data</button>
      <span>→ ${todos.loading ? "LOADING..." : summary}</span>
    </div>
  `;
}

customElements.define("example-async", Component(ExampleAsync, render));
