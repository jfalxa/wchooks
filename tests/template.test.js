import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/template";

describe("Template hook", async () => {
  beforeEach(() => render("<example-template></example-template>"));

  it("should render a component with a template", async () => {
    const element = check("example-template");

    await element.root.rendered;

    const value = element.get("#value");
    const list = element.get("#list");

    expect(value.textContent).toBe("∅");
    expect(list.querySelectorAll(".listItem").length).toBe(3);
  });

  it("should udpate the state when interacting with the elements created from the template", async () => {
    const element = check("example-template");

    await element.root.rendered;

    const value = element.get("#value");
    const radios = element.getAll(".radio");

    radios[1].click();

    await element.root.rendered;
    expect(value.textContent).toBe("b");
    expect(radios[1].checked).toBe(true);
    expect(radios[1].hasAttribute("checked")).toBe(true);

    radios[2].click();

    await element.root.rendered;
    expect(value.textContent).toBe("c");
    expect(radios[2].checked).toBe(true);
    expect(radios[2].hasAttribute("checked")).toBe(true);
    expect(radios[1].checked).toBe(false);
    expect(radios[1].hasAttribute("checked")).toBe(false);
  });
});
