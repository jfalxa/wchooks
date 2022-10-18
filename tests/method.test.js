import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/method";

describe("Method hook", async () => {
  beforeEach(() => render("<example-method></example-method>"));

  it("should expose a custom method", async () => {
    const element = check("example-method");
    expect(typeof element.root.toggleCheckbox).toBe("function");
  });

  it("should update the checkbox when calling the function", async () => {
    const element = check("example-method");

    await element.root.rendered;

    const checkbox = element.get(`input[type="checkbox"]`);

    await element.root.rendered;
    expect(checkbox.checked).toBe(false);

    element.root.toggleCheckbox();

    await element.root.rendered;
    expect(checkbox.checked).toBe(true);

    checkbox.click();

    await element.root.rendered;
    expect(checkbox.checked).toBe(false);

    element.root.toggleCheckbox();

    await element.root.rendered;
    expect(checkbox.checked).toBe(true);
  });
});
