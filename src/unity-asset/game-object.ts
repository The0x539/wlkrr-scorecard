import { AssetBase, AssetType, PPtr } from "./index.ts";

export class GameObject extends AssetBase {
  static readonly typeID = AssetType.GameObject;
  readonly typeID = AssetType.GameObject;

  components = this.r.array(this.r.u32(), (r) => new PPtr(r));
  layer = this.r.u32();
  name = this.r.paddedString();
  tag = this.r.u16();
  active = this.r.bool();
}
