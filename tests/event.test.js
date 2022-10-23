import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/event";

describe("Event hook", async () => {
  beforeEach(() => render("<example-event></example-event>"));

  it("should increment the counter when dispatching events", async () => {
    const view = checkout("example-event");
    await view.element.updated;

    const dispatchButton = view.get("#dispatch");
    const counter = view.get("#counter");

    expect(counter.textContent).toBe("0");

    dispatchButton.click();
    await view.element.updated;

    expect(counter.textContent).toBe("1");

    dispatchButton.click();
    dispatchButton.click();
    await view.element.updated;

    expect(counter.textContent).toBe("3");
  });
});
