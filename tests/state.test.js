import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/state";

describe("State hook", async () => {
  beforeEach(() => render("<example-state></example-state>"));

  it("should change the counter when clicking the buttons", async () => {
    const view = checkout("example-state");
    await view.element.updated;

    const incrementButton = view.get("#increment");
    const counter = view.get("#counter");

    expect(counter.textContent).toBe("0");

    incrementButton.click();
    await view.element.updated;

    expect(counter.textContent).toBe("3");
  });

  it("should recompute the multiplier on every counter change", async () => {
    const view = checkout("example-state");
    await view.element.updated;

    const decrementButton = view.get("#decrement");
    const multiplier = view.get("#multiplier");

    expect(multiplier.textContent).toBe("(x5 = 0)");

    decrementButton.click();
    await view.element.updated;

    expect(multiplier.textContent).toBe("(x5 = -5)");
  });
});
