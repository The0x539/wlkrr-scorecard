/// <reference lib="deno.ns" />

import { Asset, BundleFile } from "./asset-bundle.ts";
import { MonoBehaviour } from "./unity-asset/mono-behaviour.ts";
import { BinaryReader, Decodable } from "./decode.ts";
import * as fs from "@std/fs";
import { LocalizationDigest } from "./game-data/locale.ts";

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

const comment = asset.objectInfos
  .filter((oi) => oi.classID === MonoBehaviour.typeID)
  .map((oi) => new MonoBehaviour(oi.getReader(asset.buf), oi))
  .find((mb) => mb.name === "comment");

if (!comment) {
  throw new Error("oh no");
}

const payload = new BinaryReader(comment.payload);
const datas = payload.array(payload.u32(), (r) => new TextCommon(r));

const digest: LocalizationDigest = {};
for (const tc of datas) {
  digest[tc.id] = {
    ja: tc.texts.english,
    en: tc.texts.english,
    fr: tc.texts.french,
    de: tc.texts.german,
    it: tc.texts.italian,
    es: tc.texts.spanish,
    ko: tc.texts.korean,
    zht: tc.texts.traditional,
    zhs: tc.texts.simplified,
  };
}

console.log(JSON.stringify(digest));
