import { html, render } from "lit-html";
import { beforeEach, describe, expect, it } from "vitest";
import { check } from "./utils";

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
    const element = check("example-life-cycle");

    await element.root.rendered;

    const nestedElement = element.get("example-nested-life-cycle");

    const updateButton = element.get("#update");
    const removeButton = element.get("#remove");

    expect(lifeCycleSteps.length).toBe(4);

    expect(lifeCycleSteps[0].step).toBe("onConnected");
    expect(lifeCycleSteps[0].element).toBe(element.root);

    expect(lifeCycleSteps[1].step).toBe("onConnected");
    expect(lifeCycleSteps[1].element).toBe(nestedElement);

    expect(lifeCycleSteps[2].step).toBe("onRendered");
    expect(lifeCycleSteps[2].element).toBe(element.root);

    expect(lifeCycleSteps[3].step).toBe("onRendered");
    expect(lifeCycleSteps[3].element).toBe(nestedElement);

    // force rerender
    updateButton.click();
    await element.root.rendered;

    expect(lifeCycleSteps.length).toBe(6);

    expect(lifeCycleSteps[4].step).toBe("onRendered (cleared)");
    expect(lifeCycleSteps[4].element).toBe(element.root);

    expect(lifeCycleSteps[5].step).toBe("onRendered");
    expect(lifeCycleSteps[5].element).toBe(element.root);

    // force remove
    removeButton.click();
    await element.root.rendered;

    expect(lifeCycleSteps.length).toBe(10);

    expect(lifeCycleSteps[6].step).toBe("onDisconnected");
    expect(lifeCycleSteps[6].element).toBe(element.root);

    expect(lifeCycleSteps[7].step).toBe("onRendered (cleared)");
    expect(lifeCycleSteps[7].element).toBe(element.root);

    expect(lifeCycleSteps[8].step).toBe("onDisconnected");
    expect(lifeCycleSteps[8].element).toBe(nestedElement);

    expect(lifeCycleSteps[9].step).toBe("onRendered (cleared)");
    expect(lifeCycleSteps[9].element).toBe(nestedElement);
  });
});