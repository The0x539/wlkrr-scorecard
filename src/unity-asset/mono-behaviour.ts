import { AssetBase, AssetType, PPtr } from "./index.ts";

export class MonoBehaviour extends AssetBase {
  static readonly typeID = AssetType.MonoBehaviour;
  readonly typeID = AssetType.MonoBehaviour;

  gameObject = new PPtr(this.r);
  enabled = this.r.bool32();
  script = new PPtr(this.r);
  name = this.r.paddedString();

  payload = (() => {
    this.r.align(4);
    return this.r.remainder();
  })();
}
