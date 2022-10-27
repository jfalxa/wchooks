import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/event";

describe("Event hook", async () => {
  beforeEach(() => render("<example-event-container></example-event-container>"));

  it("should increment the counter when dispatching events", async () => {
    const view = checkout("example-event-container");
    await view.element.updated;

    const counter = view.get("#counter");
    const child = view.get("example-event");
    const dispatchButton = child.renderRoot.querySelector("#dispatch");

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
