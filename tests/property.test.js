import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/property";

describe("Property hook", async () => {
  beforeEach(() => render("<example-property></example-property>"));

  it("should expose a custom property", async () => {
    const element = check("example-property");
    expect(element.root.myProp).toStrictEqual([1, 2, 3, 4]);
  });

  it("should rerender the list when changing the property", async () => {
    const element = check("example-property");

    await element.root.rendered;

    const list = element.get("#list");

    await element.root.rendered;
    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    element.root.myProp = ["a", "b", "c"];

    await element.root.rendered;
    expect(list.textContent).toBe("= [a, b, c, *]");
  });

  it("should update the property when adding elements with the buttons", async () => {
    const element = check("example-property");

    const list = element.get("#list");
    const addButton = element.get("#add");
    const removeButton = element.get("#remove");

    await element.root.rendered;
    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    addButton.click();
    addButton.click();

    await element.root.rendered;
    expect(element.root.myProp).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, 6, *]");

    removeButton.click();

    await element.root.rendered;
    expect(element.root.myProp).toStrictEqual([1, 2, 3, 4, 5]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, *]");
  });
});
