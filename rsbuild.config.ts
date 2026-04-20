import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

export default defineConfig({
  html: { template: "./src/index.html" },
  dev: {
    // this seems to break the dynamic temporal-polyfill import
    lazyCompilation: false,
  },
  source: { assetsInclude: [/\.jxl$/] },
  output: {
    cleanDistPath: true,
    target: "web",
  },
  tools: {
    rspack: {
      module: {
        rules: [
          { test: /\.json$/, type: "asset/resource" },
        ],
      },
    },
  },
  plugins: [
    // prefresh just seems to throw a weird error. not my problem.
    pluginPreact({ prefreshEnabled: false }),
    pluginTypeCheck(),
  ],
});
