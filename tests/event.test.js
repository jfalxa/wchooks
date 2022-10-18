import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/event";

describe("Event hook", async () => {
  beforeEach(() => render("<example-event></example-event>"));

  it("should increment the counter when dispatching events", async () => {
    const element = check("example-event");

    await element.root.rendered;

    const dispatchButton = element.get("#dispatch");
    const counter = element.get("#counter");

    await element.root.rendered;
    expect(counter.textContent).toBe("0");

    dispatchButton.click();

    await element.root.rendered;
    expect(counter.textContent).toBe("1");

    dispatchButton.click();
    dispatchButton.click();

    await element.root.rendered;
    expect(counter.textContent).toBe("3");
  });
});
