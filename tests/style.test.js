import { beforeEach, describe, expect, it } from "vitest";
import { check, fill, render } from "./utils";

import "../examples/style";

describe("Style hook", async () => {
  beforeEach(() => render("<example-style></example-style>"));

  it("should inject CSS in the shadow DOM", async () => {
    const element = check("example-style");

    await element.root.rendered;

    const style = element.get("style");

    await element.root.rendered;
    expect(compactWhitespaces(style.textContent)).toBe(
      ".text { font-weight: bold; font-size: 16px; }"
    );
  });

  it("should update the CSS when needed", async () => {
    const element = check("example-style");

    const style = element.get("style");
    const input = element.get("input");

    await fill(input, "128");

    expect(compactWhitespaces(style.textContent)).toBe(
      ".text { font-weight: bold; font-size: 128px; }"
    );
  });
});

function compactWhitespaces(str) {
  return str.replace(/\s+/g, " ").trim();
}
