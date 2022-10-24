import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render, fill } from "./utils";

import "../examples/attribute";

describe("Attribute hook", async () => {
  beforeEach(() => render("<example-attribute-container></example-attribute-container>"));

  it("should update the num attribute", async () => {
    const view = checkout("example-attribute-container");
    await view.element.updated;

    const component = view.get("example-attribute");
    const num = component.renderRoot.querySelector("#num");

    expect(num.value).toBe("0");
    expect(component.getAttribute("num")).toBe("0");

    await fill(num, "123");
    await view.element.updated;

    expect(num.value).toBe("123");
    expect(component.getAttribute("num")).toBe("123");

    component.setAttribute("num", "321");
    await component.updated;

    expect(component.getAttribute("num")).toBe("321");
    expect(num.value).toBe("321");
  });

  it("should update the str attribute", async () => {
    const view = checkout("example-attribute-container");
    await view.element.updated;

    const component = view.get("example-attribute");
    const str = component.renderRoot.querySelector("#str");

    expect(str.value).toBe("example");
    expect(component.getAttribute("str")).toBe("example");

    await fill(str, "abcd");
    await view.element.updated;

    expect(str.value).toBe("abcd");
    expect(component.getAttribute("str")).toBe("abcd");

    component.setAttribute("str", "dcba");
    await component.updated;

    expect(str.value).toBe("dcba");
    expect(component.getAttribute("str")).toBe("dcba");
  });

  it("should update the bool attribute", async () => {
    const view = checkout("example-attribute-container");
    await view.element.updated;

    const component = view.get("example-attribute");
    const bool = component.renderRoot.querySelector("#bool");

    expect(bool.checked).toBe(true);
    expect(component.getAttribute("bool")).toBe("");

    bool.click();
    await view.element.updated;

    expect(bool.checked).toBe(false);
    expect(component.hasAttribute("bool")).toBe(false);

    component.setAttribute("bool", "");
    await component.updated;

    expect(bool.checked).toBe(true);
    expect(component.getAttribute("bool")).toBe("");
  });

  it("should update the list attribute", async () => {
    const view = checkout("example-attribute-container");
    await view.element.updated;

    const component = view.get("example-attribute");
    const list = component.renderRoot.querySelector("#list");

    expect(component.getAttribute("list")).toBe("[0]");

    list.click();
    await view.element.updated;

    expect(component.getAttribute("list")).toBe("[0,0]");

    component.setAttribute("list", "[]");
    await component.updated;

    expect(component.getAttribute("list")).toBe("[]");

    list.click();
    await view.element.updated;

    expect(component.getAttribute("list")).toBe("[0]");
  });
});
