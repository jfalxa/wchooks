import { beforeEach, describe, expect, it } from "vitest";
import { checkout, render } from "./utils";

import "../examples/ref";

describe("State hook", async () => {
  beforeEach(() => render("<example-dom-ref></example-dom-ref>"));

  it("should bind a ref to a DOM element", async () => {
    const view = checkout("example-dom-ref");
    await view.element.updated;

    const input = view.get("input");

    expect(window.inputRef.value).toBe(input);
  });
});
