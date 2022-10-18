import { beforeEach, describe, expect, it } from "vitest";
import { check, render, until } from "./utils";

import "../examples/async";

describe("Async hook", async () => {
  beforeEach(() => render("<example-async></example-async>"));

  it("should fetch data and update the ui as it loads", async () => {
    const element = check("example-async");

    await element.root.rendered;

    const callButton = element.get("#call");
    const result = element.get("#result");

    await element.root.rendered;
    expect(result.textContent).toBe("→ ∅");

    callButton.click();

    await element.root.rendered;
    expect(result.textContent).toBe("→ LOADING...");

    await until(() => expect(result.textContent).toBe("→ 200 todo items found"));
  });

  it("should show an error if there's a problem during the async operation", async () => {
    const element = check("example-async");

    const callErrorButton = element.get("#call-error");
    const result = element.get("#result");

    callErrorButton.click();

    await element.root.rendered;
    expect(result.textContent).toBe("→ LOADING...");

    await until(() => expect(result.textContent).toBe("→ Error: could not fetch todos"));
  });
});
