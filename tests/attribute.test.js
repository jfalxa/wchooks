import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render, fill } from "./utils";

import "../examples/attribute";

describe("Attribute hook", async () => {
  beforeEach(() => render("<example-attribute></example-attribute>"));

  it("should update the element attribute when filling the input", async () => {
    const view = checkout("example-attribute");

    await view.element.rendered;

    expect(view.element.getAttribute("my-attr")).toBeNull();

    const input = view.get("input");

    await fill(input, "123");

    expect(input.value).toBe("123");
    expect(view.element.getAttribute("my-attr")).toBe("123");
  });

  it("should update the input value when changing the attribute", async () => {
    const view = checkout("example-attribute");

    const input = view.get("input");

    await view.element.rendered;
    expect(input.value).toBe("");

    view.element.setAttribute("my-attr", "123");
    expect(view.element.getAttribute("my-attr")).toBe("123");

    await view.element.rendered;
    expect(input.value).toBe("123");
  });
});
