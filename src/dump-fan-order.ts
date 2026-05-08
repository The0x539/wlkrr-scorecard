/// <reference lib="deno.ns" />

import { Asset, BundleFile } from "./asset-bundle.ts";
import { BinaryReader } from "./decode.ts";
import * as fs from "@std/fs";
import { GameObject } from "./unity-asset/game-object.ts";
import { ShortcutController } from "./unity-asset/shortcut-controller.ts";

const steamDir = [
  "C:/Program Files (x86)/Steam",
  "/mnt/c/Program Files (x86)/Steam",
].find((p) => fs.existsSync(p));

if (!steamDir) {
  console.log("could not locate Steam installation");
  Deno.exit(1);
}

const assetPath = [
  steamDir,
  "steamapps",
  "common",
  "WLKRR",
  "WLKRR_Data",
  "StreamingAssets",
  "aa",
  "StandaloneWindows64",
  "scenes_scenes_selecthirobascene_c6fe7ccd39c77761bc0fa9eac17a1dea.bundle",
].join("/");

const bundleData = Deno.readFileSync(assetPath).buffer;
const bundleReader = new BinaryReader(bundleData);
const bundle = new BundleFile(bundleReader);

const scene = new Asset(bundle.getFile(2).buffer);

scene.objectInfos.unshift(null!);

const shortcutObj = (() => {
  for (const oi of scene.objectInfos) {
    if (!oi) continue;
    if (oi.classID !== GameObject.typeID) continue;

    const obj = new GameObject(oi.getReader(scene.buf));
    if (obj.name !== "Shortcut") continue;

    return obj;
  }
  throw new Error("Shortcut controller object not found");
})();

const controllerInfo = scene.objectInfos[shortcutObj.components[3].pathID];
const shortcutController = new ShortcutController(
  controllerInfo.getReader(scene.buf),
);

const meadowFlat = shortcutController.select_fan_list.map((f) => f.fan_index);
const pages = [5, 5, 4, 4, 4, 6]; // hardcoded ingame
const meadowOrder = pages.map((count) => meadowFlat.splice(0, count));

const memoryOrder = shortcutController.putit_kadai_list.map((f) => f.fan_index);

console.log(
  `export const meadowOrder = ${JSON.stringify(meadowOrder)};`,
);
console.log(
  `export const memoryOrder = ${JSON.stringify(memoryOrder)};`,
);
