import { beforeEach, describe, expect, it } from "vitest";
import { checkout, fill, render } from "./utils";

import "../examples/style";

describe("Style hook", async () => {
  beforeEach(() => render("<example-style></example-style>"));

  it("should inject CSS in the shadow DOM", async () => {
    const view = checkout("example-style");

    await view.element.rendered;

    const style = view.get("style");

    await view.element.rendered;
    expect(compactWhitespaces(style.textContent)).toBe(
      ".text { font-weight: bold; font-size: 16px; }"
    );
  });

  it("should update the CSS when needed", async () => {
    const view = checkout("example-style");

    const style = view.get("style");
    const input = view.get("input");

    await fill(input, "128");

    expect(compactWhitespaces(style.textContent)).toBe(
      ".text { font-weight: bold; font-size: 128px; }"
    );
  });
});

function compactWhitespaces(str) {
  return str.replace(/\s+/g, " ").trim();
}
