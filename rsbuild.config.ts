import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import { Buffer } from "node:buffer";

import type { RsbuildPlugin, RsbuildPluginAPI, Rspack } from "@rsbuild/core";

// I shouldn't have needed to do any of this.
const pluginFixPrefresh = (name = "fix-prefresh"): RsbuildPlugin => ({
  name,
  apply: "serve",
  post: ["preact-refresh"],
  setup(api: RsbuildPluginAPI) {
    api.modifyBundlerChain((chain, { isDev }) => {
      if (!isDev) {
        return;
      }

      chain.plugin(name).use({
        name,
        apply(compiler: Rspack.Compiler) {
          compiler.hooks.thisCompilation.tap(name, (compilation) => {
            compilation.hooks.runtimeModule.tap(name, (runtimeModule) => {
              const moduleName = runtimeModule.constructor.name;
              if (!moduleName.includes("HotModule")) {
                return;
              }

              const moduleSource = runtimeModule.source!;
              let src: string = moduleSource.source.toString("utf-8");
              for (const thing of ["RefreshReg", "RefreshSig"]) {
                src = src.replaceAll(
                  `self.$${thing}$ = prev${thing};`,
                  `self.$${thing}$ = prev${thing} ?? self.$${thing}$;`,
                );
              }
              moduleSource.source = Buffer.from(src, "utf-8");
            });
          });
        },
      });
    });
  },
});

export default defineConfig({
  html: {
    template: "./src/index.html",
    favicon: "./src/assets/prince.png",
    appIcon: {
      name: "We ❤️ Katamari Scorecard",
      icons: [{ src: "./src/assets/king.png", size: 512 }],
    },
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
    pluginPreact(),
    pluginFixPrefresh(),
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
