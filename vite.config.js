import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: true,
    outDir: ".",

    lib: {
      entry: resolve(__dirname, "wchooks.js"),
      name: "wchooks",
      formats: ["es"],
      fileName: () => "wchooks.min.js",
    },
  },

  test: {
    globals: true,
    environment: "jsdom",

    alias: {
      "https://unpkg.com/lit-html": "lit-html",
    },

    coverage: {
      include: ["wchooks.js"],
    },
  },
});
