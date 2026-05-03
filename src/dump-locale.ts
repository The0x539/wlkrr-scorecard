/// <reference lib="deno.ns" />

import { Asset, BundleFile } from "./asset-bundle.ts";
import { MonoBehaviour } from "./unity-asset/mono-behaviour.ts";
import { BinaryReader, Decodable } from "./decode.ts";
import * as fs from "@std/fs";

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
  "scriptableobject_assets_all_0ff3f5d7e008773609ea80b91100a39f.bundle",
].join("/");

const bundleData = Deno.readFileSync(assetPath).buffer;
const bundleReader = new BinaryReader(bundleData);
const bundle = new BundleFile(bundleReader);
const asset = new Asset(bundle.getFile(0).buffer);

class TextCommon extends Decodable {
  id = this.r.paddedString();
  texts = new LocalizeText(this.r);
  overrideTexts = this.r.array(this.r.u32(), (r) => new LocalizeText(r));
}

class LocalizeText extends Decodable {
  japanese = this.r.paddedString();
  english = this.r.paddedString();
  french = this.r.paddedString();
  german = this.r.paddedString();
  italian = this.r.paddedString();
  spanish = this.r.paddedString();
  korean = this.r.paddedString();
  traditional = this.r.paddedString();
  simplified = this.r.paddedString();
}

const behaviours = new Map<string, MonoBehaviour>();
for (const oi of asset.objectInfos) {
  if (oi.classID !== MonoBehaviour.typeID) {
    continue;
  }
  const mb = new MonoBehaviour(oi.getReader(asset.buf), oi);
  behaviours.set(mb.name, mb);
}

const categories = ["system", "comment", "name", "present", "select"];

for (const category of categories) {
  Deno.mkdirSync(`src/game-data/locale/${category}/`, { recursive: true });

  const groups: Record<string, string[]> = {};
  const obj = behaviours.get(category)!;
  const payload = new BinaryReader(obj.payload);
  const datas = payload.array(payload.u32(), (r) => new TextCommon(r));

  for (const tc of datas) {
    for (const [language, text] of Object.entries(tc.texts)) {
      groups[language] ??= [];
      groups[language].push(text.replace("\n", " ").trim());
    }
  }

  for (const [language, list] of Object.entries(groups)) {
    const path = `src/game-data/locale/${category}/${language}.txt`;
    Deno.writeTextFileSync(path, list!.join("\n"));
  }
}
