import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render, fill } from "./utils";

import "../examples/attribute";

describe("Attribute hook", async () => {
  beforeEach(() => render("<example-attribute></example-attribute>"));

  it("should update the my-num attribute", async () => {
    const view = checkout("example-attribute");
    await view.element.rendered;

    const num = view.get("input#num");
    expect(num.value).toBe("0");
    expect(view.element.getAttribute("my-num")).toBe("0");

    await fill(num, "123");
    await view.element.rendered;

    expect(num.value).toBe("123");
    expect(view.element.getAttribute("my-num")).toBe("123");

    view.element.setAttribute("my-num", "123");
    await view.element.rendered;

    expect(view.element.getAttribute("my-num")).toBe("123");
    expect(num.value).toBe("123");
  });

  it("should update the my-str attribute", async () => {
    const view = checkout("example-attribute");
    await view.element.rendered;

    const str = view.get("input#str");
    expect(str.value).toBe("example");
    expect(view.element.getAttribute("my-str")).toBe("example");

    await fill(str, "abcd");
    await view.element.rendered;

    expect(str.value).toBe("abcd");
    expect(view.element.getAttribute("my-str")).toBe("abcd");

    view.element.setAttribute("my-str", "dcba");
    await view.element.rendered;

    expect(str.value).toBe("dcba");
    expect(view.element.getAttribute("my-str")).toBe("dcba");
  });

  it("should update the my-bool attribute", async () => {
    const view = checkout("example-attribute");
    await view.element.rendered;

    const bool = view.get("input#bool");
    expect(bool.checked).toBe(true);
    expect(view.element.getAttribute("my-bool")).toBe("");

    bool.click();
    await view.element.rendered;

    expect(bool.checked).toBe(false);
    expect(view.element.hasAttribute("my-bool")).toBe(false);

    view.element.setAttribute("my-bool", "");
    await view.element.rendered;

    expect(bool.checked).toBe(true);
    expect(view.element.getAttribute("my-bool")).toBe("");
  });

  it("should update the my-list attribute", async () => {
    const view = checkout("example-attribute");
    await view.element.rendered;

    const list = view.get("input#list");
    expect(view.element.getAttribute("my-list")).toBe("[0]");

    list.click();
    await view.element.rendered;

    expect(view.element.getAttribute("my-list")).toBe("[0,0]");

    view.element.setAttribute("my-list", "[]");
    await view.element.rendered;

    list.click();
    await view.element.rendered;

    expect(view.element.getAttribute("my-list")).toBe("[0]");
  });

  it("should update the my-custom attribute", async () => {
    const view = checkout("example-attribute");
    await view.element.rendered;

    const custom = view.get("input#custom");
    expect(custom.value).toBe("1");
    expect(view.element.getAttribute("my-custom")).toBe("key-1");

    await fill(custom, "123");
    await view.element.rendered;

    expect(custom.value).toBe("123");
    expect(view.element.getAttribute("my-custom")).toBe("key-123");

    view.element.setAttribute("my-custom", "123");
    await view.element.rendered;

    expect(custom.value).toBe("123");
    expect(view.element.getAttribute("my-custom")).toBe("123");
  });
});
