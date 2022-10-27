import { html, render } from "lit-html";
import { beforeEach, describe, expect, it } from "vitest";
import { checkout } from "./utils";

import "../examples/lifecycle";

let lifeCycleSteps = [];
function pushStep(step) {
  lifeCycleSteps.push(step);
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

    const updateButton = view.get("#update");
    const removeButton = view.get("#remove");

    expect(lifeCycleSteps.length).toBe(2);

    expect(lifeCycleSteps[0]).toBe("useEffect 1.");
    expect(lifeCycleSteps[1]).toBe("child useEffect 1.");

    // force rerender
    updateButton.click();
    await view.element.updated;

    expect(lifeCycleSteps.length).toBe(6);

    expect(lifeCycleSteps[2]).toBe("useEffect 1. (cleared)");
    expect(lifeCycleSteps[3]).toBe("useEffect 2.");
    expect(lifeCycleSteps[4]).toBe("child useEffect 1. (cleared)");
    expect(lifeCycleSteps[5]).toBe("child useEffect 2.");

    // force remove
    removeButton.click();
    await view.element.updated;

    expect(lifeCycleSteps.length).toBe(8);
    expect(lifeCycleSteps[6]).toBe("useEffect 2. (cleared)");
    expect(lifeCycleSteps[7]).toBe("child useEffect 2. (cleared)");
  });
});
