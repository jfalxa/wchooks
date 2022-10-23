import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/reducer";

describe("Reducer hook", async () => {
  beforeEach(() => render("<example-reducer></example-reducer>"));

  it("should change the counter when clicking the buttons", async () => {
    const view = checkout("example-reducer");
    await view.element.updated;

    const counter = view.get("#counter");
    const addButton = view.get("#add");
    const subButton = view.get("#sub");

    expect(counter.textContent).toBe("0");

    addButton.click();
    addButton.click();
    await view.element.updated;

    expect(counter.textContent).toBe("4");

    subButton.click();
    await view.element.updated;

    expect(counter.textContent).toBe("2");
  });
});
