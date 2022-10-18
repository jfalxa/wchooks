import { beforeEach, describe, expect, it } from "vitest";
import { check, render } from "./utils";

import "../examples/ref";

describe("State hook", async () => {
  beforeEach(() => render("<example-dom-ref></example-dom-ref>"));

  it("should bind a ref to a DOM element", async () => {
    const element = check("example-dom-ref");

    await element.root.rendered;

    const input = element.get("input");

    expect(window.inputRef.value).toBe(input);
  });
});
