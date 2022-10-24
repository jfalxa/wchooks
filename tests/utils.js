export function render(html) {
  document.body.innerHTML = html;
}

export function checkout(selector, root = document) {
  const element = root.querySelector(selector);
  if (element === null) throw new Error(`No element found with selector ${selector}`);

  function query(selector) {
    return element.renderRoot.querySelector(selector);
  }

  function queryAll(selector) {
    return element.renderRoot.querySelectorAll(selector);
  }

  function get(selector) {
    const child = query(selector);
    if (child === null) throw new Error(`No child found with selector ${selector}`);
    return child;
  }

  function getAll(selector) {
    const children = queryAll(selector);
    if (children.length === 0) throw new Error(`No children found with selector ${selector}`);
    return children;
  }

  return { element, query, queryAll, get, getAll };
}

export function until(condition, options = {}) {
  return new Promise((resolve, reject) => {
    let lastError;

    const _timeout = setTimeout(() => {
      clearInterval(interval);
      reject(lastError);
    }, options.timeout ?? 2000);

    const interval = setInterval(() => {
      try {
        condition();
        clearTimeout(_timeout);
        resolve();
      } catch (error) {
        lastError = error;
      }
    }, 16);
  });
}

export function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function fill(input, text) {
  for (let i = 0; i < text.length; i++) {
    input.value = text.slice(0, i + 1);
    input.dispatchEvent(new Event("input"));
    await wait(1);
  }
}
