import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/property";

describe("Property hook", async () => {
  beforeEach(() => render("<example-property-container></example-property-container>"));

  it("should expose a custom property", async () => {
    const view = checkout("example-property-container");
    const component = view.get("example-property");
    await component.updated;
    expect(component.myProp).toStrictEqual([1, 2, 3, 4]);
  });

  it("should rerender the list when changing the property", async () => {
    const view = checkout("example-property-container");
    await view.element.updated;

    const component = view.get("example-property");
    const list = component.renderRoot.querySelector("#list");

    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    component.myProp = ["a", "b", "c"];
    await component.updated;

    expect(list.textContent).toBe("= [a, b, c, *]");
  });

  it("should update the property when adding elements with the buttons", async () => {
    const view = checkout("example-property-container");
    await view.element.updated;

    const component = view.get("example-property");
    const list = component.renderRoot.querySelector("#list");

    const addButton = view.get("#add");
    const removeButton = view.get("#remove");

    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    addButton.click();
    await view.element.updated;

    addButton.click();
    await view.element.updated;

    expect(component.myProp).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, 6, *]");

    removeButton.click();
    await view.element.updated;

    expect(component.myProp).toStrictEqual([1, 2, 3, 4, 5]);
    expect(list.textContent).toBe("= [1, 2, 3, 4, 5, *]");
  });

  it("should clear the list when clicking the reset button", async () => {
    const view = checkout("example-property-container");
    await view.element.updated;

    const component = view.get("example-property");
    const addButton = view.get("#add");
    const list = component.renderRoot.querySelector("#list");

    const resetChild = component.renderRoot.querySelector("#reset");
    const resetChildFromParent = view.get("#reset");

    expect(list.textContent).toBe("= [1, 2, 3, 4, *]");

    resetChild.click();
    await component.updated;

    expect(list.textContent).toBe("= [*]");

    addButton.click();
    await view.element.updated;

    addButton.click();
    await view.element.updated;

    expect(list.textContent).toBe("= [1, 2, *]");

    resetChildFromParent.click();
    await component.updated;

    expect(list.textContent).toBe("= [*]");
  });
});
