import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render, until } from "./utils";

import "../examples/async";

describe("Async hook", async () => {
  beforeEach(() => render("<example-async></example-async>"));

  it("should fetch data and update the ui as it loads", async () => {
    const view = checkout("example-async");
    await view.element.rendered;

    const callButton = view.get("#call");
    const result = view.get("#result");

    expect(result.textContent).toBe("→ ∅");

    callButton.click();
    await view.element.rendered;

    expect(result.textContent).toBe("→ LOADING...");
    await until(() => expect(result.textContent).toBe("→ 200 todo items found"));
  });

  it("should show an error if there's a problem during the async operation", async () => {
    const view = checkout("example-async");
    await view.element.rendered;

    const callErrorButton = view.get("#call-error");
    const result = view.get("#result");

    callErrorButton.click();
    await view.element.rendered;

    expect(result.textContent).toBe("→ LOADING...");
    await until(() => expect(result.textContent).toBe("→ Error: could not fetch todos"));
  });
});
