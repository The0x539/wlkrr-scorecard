/// <reference lib="deno.ns" />

import { Asset, BundleFile } from "./asset-bundle.ts";
import { BinaryReader } from "./decode.ts";
import * as fs from "@std/fs";
import { GameObject } from "./unity-asset/game-object.ts";
import { ShortcutController } from "./unity-asset/shortcut-controller.ts";
import {
  gameFan2Mission,
  gameMission2Fan,
  recordCategoryId,
} from "./game-data/fans.ts";

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

// const scripts = new Asset(bundle.getFile(0).buffer);
const scene = new Asset(bundle.getFile(2).buffer);

// scripts.objectInfos.unshift(null!);
scene.objectInfos.unshift(null!);

for (const oi of scene.objectInfos) {
  if (!oi) continue;
  if (oi.classID !== GameObject.typeID) continue;

  const obj = new GameObject(oi.getReader(scene.buf));
  if (obj.name !== "Shortcut") continue;

  const ci = scene.objectInfos[obj.components[3].pathID];
  const _sc = new ShortcutController(ci.getReader(scene.buf));

  break;
}

const select = Deno.readTextFileSync("src/game-data/locale/select/english.txt")
  .split("\n");

for (const x of recordCategoryId) {
  console.log(x.map((i) => select[i]));
}

console.log(gameFan2Mission.length);
console.log(gameMission2Fan.length);

// Next area of research:
// SelectHiroba_TalkOption.sRecord
// Game.mYm_GiMi_StarID
// SelectHiroba_TalkOption.u8MisNo
//
// Do "missions" correspond to a map and props within it, and then a stage is, like, large vs. fast?
