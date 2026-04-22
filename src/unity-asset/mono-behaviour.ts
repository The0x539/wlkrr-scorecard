import { ObjectInfo } from "../asset-bundle.ts";
import { BinaryReader } from "../decode.ts";
import { AssetBase, AssetType, PPtr } from "./index.ts";

export class MonoBehaviour extends AssetBase {
  static readonly typeID = AssetType.MonoBehaviour;
  readonly typeID = AssetType.MonoBehaviour;

  gameObject: PPtr;
  enabled: boolean;
  script: PPtr;
  name: string;

  payload: ArrayBuffer;

  constructor(r: BinaryReader, info: ObjectInfo) {
    super(r);

    this.gameObject = new PPtr(r, info.version);
    this.enabled = r.bool32();
    this.script = new PPtr(r, info.version);
    this.name = r.paddedString();
    r.align(4);

    this.payload = r.remainder();
  }
}
