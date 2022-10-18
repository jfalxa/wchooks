import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/state";

describe("State hook", async () => {
  beforeEach(() => render("<example-state></example-state>"));

  it("should change the counter when clicking the buttons", async () => {
    const element = check("example-state");

    await element.root.rendered;

    const incrementButton = element.get("#increment");
    const counter = element.get("#counter");

    await element.root.rendered;
    expect(counter.textContent).toBe("0");

    incrementButton.click();

    await element.root.rendered;
    expect(counter.textContent).toBe("3");
  });

  it("should recompute the multiplier on every counter change", async () => {
    const element = check("example-state");

    const decrementButton = element.get("#decrement");
    const multiplier = element.get("#multiplier");

    await element.root.rendered;
    expect(multiplier.textContent).toBe("(x5 = 0)");

    decrementButton.click();

    await element.root.rendered;
    expect(multiplier.textContent).toBe("(x5 = -5)");
  });
});
