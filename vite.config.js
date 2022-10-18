import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: true,
    outDir: ".",

    lib: {
      entry: resolve(__dirname, "wchooks.mjs"),
      name: "wchooks",
      formats: ["es"],
      fileName: () => "wchooks.js",
    },
  },

  test: {
    globals: true,
    environment: "jsdom",

    alias: {
      "https://unpkg.com/lit-html": "lit-html",
    },

    coverage: {
      include: ["wchooks.mjs"],
    },
  },
});
