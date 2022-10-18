import { beforeEach, describe, expect, it } from "vitest";
import { check, render, fill } from "./utils";

import "../examples/attribute";

describe("Attribute hook", async () => {
  beforeEach(() => render("<example-attribute></example-attribute>"));

  it("should update the element attribute when filling the input", async () => {
    const element = check("example-attribute");

    await element.root.rendered;

    expect(element.root.getAttribute("my-attr")).toBeNull();

    const input = element.get("input");

    await fill(input, "123");

    expect(input.value).toBe("123");
    expect(element.root.getAttribute("my-attr")).toBe("123");
  });

  it("should update the input value when changing the attribute", async () => {
    const element = check("example-attribute");

    const input = element.get("input");

    await element.root.rendered;
    expect(input.value).toBe("");

    element.root.setAttribute("my-attr", "123");
    expect(element.root.getAttribute("my-attr")).toBe("123");

    await element.root.rendered;
    expect(input.value).toBe("123");
  });
});
