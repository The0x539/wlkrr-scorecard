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
    filenameHash: false,
    filename: {
      image: (pathData) => pathData.filename!.replace(/^src\/assets\//, ""),
      assets: (pathData) => pathData.filename!.replace(/^src\/game-data\//, ""),
    },
  },
  tools: {
    rspack: {
      module: {
        rules: [
          { test: /\.json$/, type: "asset/resource" },
          { test: /\.txt$/, type: "asset/resource" },
        ],
      },
    },
  },
  plugins: [
    // prefresh just seems to throw a weird error. not my problem.
    pluginPreact({ prefreshEnabled: false }),
    pluginTypeCheck({
      tsCheckerOptions: {
        typescript: {
          configOverwrite: {
            exclude: [
              // TODO: Figure out a good way to just properly isolate these so they're not type-checked with the web stuff
              "./src/dump-locale.ts",
              "./src/dump-fan-order.ts",
              "./src/asset-bundle.ts",
              "./src/sandbox.ts",
              "./src/unity-asset/mono-behaviour.ts",
              "./src/unity-asset/index.ts",
            ],
          },
        },
      },
    }),
  ],
});
