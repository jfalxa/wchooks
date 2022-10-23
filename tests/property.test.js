import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/property";

describe("Property hook", async () => {
  beforeEach(() => render("<example-property></example-property>"));

  it("should expose a custom property", async () => {
    const view = checkout("example-property");
    await view.element.rendered;
    expect(view.element.myProp).toStrictEqual([1, 2, 3, 4]);
  });

  it("should rerender the list when changing the property", async () => {
    const view = checkout("example-property");
    await view.element.rendered;

    const list = view.get("#list");

    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    view.element.myProp = ["a", "b", "c"];
    await view.element.rendered;

    expect(list.textContent).toBe("= [a, b, c, *]");
  });

  it("should update the property when adding elements with the buttons", async () => {
    const view = checkout("example-property");
    await view.element.rendered;

    const list = view.get("#list");
    const addButton = view.get("#add");
    const removeButton = view.get("#remove");

    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    addButton.click();
    await view.element.rendered;

    addButton.click();
    await view.element.rendered;

    expect(view.element.myProp).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, 6, *]");

    removeButton.click();
    await view.element.rendered;

    expect(view.element.myProp).toStrictEqual([1, 2, 3, 4, 5]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, *]");
  });
});
