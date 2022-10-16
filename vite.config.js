import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: true,
    emptyOutDir: true,

    lib: {
      name: "wchooks",
      entry: resolve(__dirname, "lib/wchooks.mjs"),
      formats: ["es", "cjs", "umd"],
    },
  },
});
