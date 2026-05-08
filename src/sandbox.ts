/// <reference lib="deno.ns" />

import { Asset, BundleFile } from "./asset-bundle.ts";
import { BinaryReader } from "./decode.ts";
import * as fs from "@std/fs";
import { GameObject } from "./unity-asset/game-object.ts";
import { ShortcutController } from "./unity-asset/shortcut-controller.ts";
import { recordCategoryId } from "./game-data/fans.ts";
import { missions } from "./game-data/missions.ts";

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

const loadLocale = (s: string) =>
  Deno.readTextFileSync(`src/game-data/locale/${s}/english.txt`).split("\n");

const english = {
  select: loadLocale("select"),
  name: loadLocale("name"),
};

for (const oi of scene.objectInfos) {
  if (!oi) continue;
  if (oi.classID !== GameObject.typeID) continue;

  const obj = new GameObject(oi.getReader(scene.buf));
  if (obj.name !== "Shortcut") continue;

  const ci = scene.objectInfos[obj.components[3].pathID];
  const sc = new ShortcutController(ci.getReader(scene.buf));
  for (const fan of sc.select_fan_list) {
    const fi = fan.fan_index;
    const si = fi + 2800;
    console.log(fi, si, english.name[si]);
  }

  break;
}

for (const i in recordCategoryId) {
  for (const j in recordCategoryId[i]) {
    const k = recordCategoryId[i][j];
    console.log(k, english.select[k]);
    console.log("\t\t", missions[i][j]);
  }
  console.log();
}

// Next area of research:
// Figure out how the save file slots are correlated with fans and missions.
// This will probably involve looking into the code that looks up the scores.
// Annoyingly, this is obfuscated behind the way that save data is converted between two different data types.
