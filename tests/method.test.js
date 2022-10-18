import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/method";

describe("Method hook", async () => {
  beforeEach(() => render("<example-method-container></example-method-container>"));

  it("should expose a custom method", async () => {
    const view = checkout("example-method-container");

    await view.element.rendered;

    const child = view.get("example-method");
    expect(typeof child.toggleCheckbox).toBe("function");
  });

  it("should rerender when calling the function from anywhere", async () => {
    const view = checkout("example-method-container");

    await view.element.rendered;

    const checked = view.get("#checked");
    const parentToggleButton = view.get("button");

    const child = view.get("example-method");
    const toggle = child.renderRoot.querySelector("#toggle");
    const checkbox = child.renderRoot.querySelector(`input[type="checkbox"]`);
    const childToggleButton = child.renderRoot.querySelector("button");

    await view.element.rendered;
    expect(checkbox.checked).toBe(false);
    expect(toggle.textContent).toBe("OFF");
    expect(checked.textContent).toBe("(checked=false)");

    child.toggleCheckbox();

    await view.element.rendered;
    expect(checkbox.checked).toBe(true);
    expect(toggle.textContent).toBe("ON");
    expect(checked.textContent).toBe("(checked=true)");

    checkbox.click();

    await view.element.rendered;
    expect(checkbox.checked).toBe(false);
    expect(toggle.textContent).toBe("OFF");
    expect(checked.textContent).toBe("(checked=false)");

    childToggleButton.click();

    await view.element.rendered;
    expect(checkbox.checked).toBe(true);
    expect(toggle.textContent).toBe("ON");
    expect(checked.textContent).toBe("(checked=true)");

    parentToggleButton.click();

    await view.element.rendered;
    expect(checkbox.checked).toBe(false);
    expect(toggle.textContent).toBe("OFF");
    expect(checked.textContent).toBe("(checked=false)");
  });
});
