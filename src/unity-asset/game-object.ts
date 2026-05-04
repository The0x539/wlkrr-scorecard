import { ObjectInfo } from "../asset-bundle.ts";
import { BinaryReader } from "../decode.ts";
import { AssetBase, AssetType, PPtr } from "./index.ts";

export class GameObject extends AssetBase {
  static readonly typeID = AssetType.GameObject;
  readonly typeID = AssetType.GameObject;

  components: PPtr[];
  layer: number;
  name: string;
  tag: number;
  active: boolean;

  constructor(r: BinaryReader, info: ObjectInfo) {
    super(r);
    this.components = r.array(r.u32(), (r) => new PPtr(r, info.version));
    this.layer = r.u32();
    this.name = r.paddedString();
    this.tag = r.u16();
    this.active = r.bool();
  }
}
