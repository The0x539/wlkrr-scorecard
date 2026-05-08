import { Decodable } from "../decode.ts";
import { PPtr } from "./index.ts";
import { MonoBehaviour } from "./mono-behaviour.ts";

export class ShortcutController extends MonoBehaviour {
  select_fan_list = this.r.array(this.r.u32(), (r) => new ShortcutFan(r));
  putit_kadai_list = this.r.array(this.r.u32(), (r) => new ShortcutFan(r));
  back_sprite = this.r.array(this.r.u32(), (r) => new PPtr(r));
  rotation_speed = this.r.f32();
  hit_trigger = new PPtr(this.r);
  select_color = this.r.array(this.r.u32(), (r) => r.array(4, r.f32));
  hiroba_index_parent = new PPtr(this.r);
  fan_list_parent = new PPtr(this.r);
  petit_kadai_list_parent = new PPtr(this.r);
  yes_or_no = new PPtr(this.r);
  petit_memoire = new PPtr(this.r);
  game_end = new PPtr(this.r);
  select_text_material = this.r.array(this.r.u32(), (r) => new PPtr(r));
  r1_l1_key = this.r.array(this.r.u32(), (r) => new PPtr(r));
  state = this.r.i32();
  last_state = this.r.i32();
}

export class ShortcutFan extends Decodable {
  disp_flg = this.r.bool32();
  fan_index = this.r.i32();
  new_flg = this.r.bool32();
  // initialized later to fan_index + 2800, or fan_index + 233 for Royal Reverie
  string_index = this.r.i32();
  back = new PPtr(this.r);
  image = new PPtr(this.r);
  name = new PPtr(this.r);
  name_material = new PPtr(this.r);
  new_text = new PPtr(this.r);
  r_transform = new PPtr(this.r);
}
