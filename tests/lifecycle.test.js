import { html, render } from "lit-html";
import { beforeEach, describe, expect, it } from "vitest";
import { checkout } from "./utils";

import "../examples/lifecycle";

let lifeCycleSteps;

function pushStep(step, element, extras = {}) {
  lifeCycleSteps.push({ step, element, ...extras });
}

describe("Lifecycle hooks", async () => {
  beforeEach(() => {
    lifeCycleSteps = [];
    document.body.innerHTML = "";
    render(html`<example-life-cycle .onLifeCycle=${pushStep}></example-life-cycle>`, document.body);
  });

  it("should keep track of a component's lifecycle", async () => {
    const view = checkout("example-life-cycle");
    await view.element.updated;

    const nestedElement = view.get("example-nested-life-cycle");
    const updateButton = view.get("#update");
    const removeButton = view.get("#remove");

    expect(lifeCycleSteps.length).toBe(2);

    expect(lifeCycleSteps[0].step).toBe("useEffect 1.");
    expect(lifeCycleSteps[0].element).toBe(view.element);

    expect(lifeCycleSteps[1].step).toBe("useEffect 1.");
    expect(lifeCycleSteps[1].element).toBe(nestedElement);

    // force rerender
    updateButton.click();
    await view.element.updated;

    expect(lifeCycleSteps.length).toBe(6);

    expect(lifeCycleSteps[2].step).toBe("useEffect 1. (cleared)");
    expect(lifeCycleSteps[2].element).toBe(view.element);

    expect(lifeCycleSteps[3].step).toBe("useEffect 2.");
    expect(lifeCycleSteps[3].element).toBe(view.element);

    expect(lifeCycleSteps[4].step).toBe("useEffect 1. (cleared)");
    expect(lifeCycleSteps[4].element).toBe(nestedElement);

    expect(lifeCycleSteps[5].step).toBe("useEffect 2.");
    expect(lifeCycleSteps[5].element).toBe(nestedElement);

    // force remove
    removeButton.click();
    await view.element.updated;

    expect(lifeCycleSteps.length).toBe(8);

    expect(lifeCycleSteps[6].step).toBe("useEffect 2. (cleared)");
    expect(lifeCycleSteps[6].element).toBe(view.element);

    expect(lifeCycleSteps[7].step).toBe("useEffect 2. (cleared)");
    expect(lifeCycleSteps[7].element).toBe(nestedElement);
  });
});
