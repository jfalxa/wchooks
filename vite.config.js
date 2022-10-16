import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "docs",

  resolve: {
    alias: {
      "https://unpkg.com/wchooks?module": "wchooks.mjs",
    },
  },

  build: {
    minify: true,
    outDir: "..",

    lib: {
      entry: resolve(__dirname, "wchooks.mjs"),
      fileName: () => "wchooks.js",
      formats: ["es"],
    },
  },
});
