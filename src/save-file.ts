import { BinaryReader, Decodable } from "./decode.ts";

const u8 = (r: BinaryReader) => r.u8();
const i8 = (r: BinaryReader) => r.i8();
const u16 = (r: BinaryReader) => r.u16();
const i16 = (r: BinaryReader) => r.i16();
const u32 = (r: BinaryReader) => r.u32();
const bool = (r: BinaryReader) => r.bool();

export default class SaveFile extends Decodable {
  version = this.r.array(4, u8);
  users = this.r.triple((r) => new SaveInfo(r));
  photo_info = new SavePhotoInfo(this.r);
  system_data = new SystemData(this.r);
  last_user = this.r.u8();
  checksum = this.r.u32();
  // "checkchecksum"?

  timestamp(): Temporal.PlainDateTime | null {
    return this.users
      .map((s) => s.sys.timestamp())
      .filter((t) => t !== null)
      .toSorted(Temporal.PlainDateTime.compare)
      .toReversed()[0];
  }
}

export class SaveInfo extends Decodable {
  sys = new SaveInfoSys(this.r);
  option = new SaveInfoOption(this.r);
  game = new SaveInfoGame(this.r);
  tutorial = new SaveInfoTutorial(this.r);
  ending_count = this.r.u8();
}

export class SaveInfoSys extends Decodable {
  total_play_time = this.r.u32();
  title_loop_count = this.r.u32();
  game_play_count = this.r.u32();
  save_no = this.r.u8();
  language = this.r.u8();
  save_date = this.r.array(5, u32);
  keyboard_assign = this.r.array(14, i16);
  reserved = this.r.array(2, i8);

  timestamp(): Temporal.PlainDateTime | null {
    const [year, month, day, hour, minute] = this.save_date;
    if (day === 0) return null;
    return Temporal.PlainDateTime.from({ year, month, day, hour, minute });
  }
}

export class SaveInfoOption extends Decodable {
  // TODO: Confirm the order these come in. The decompiled code is a bit of a nightmare.
  visual_mode = this.r.i8();
  navigate_mode = this.r.i8();
  control_type = this.r.pair(i8);
  vib = this.r.pair(bool);
  move_mode = this.r.i8();
}

export class SaveInfoGame extends Decodable {
  present = this.r.array(32, bool);
  present_new = this.r.array(32, bool);
  stamp_get = this.r.array(50, bool);
  movie = this.r.array(32, bool);
  bgm = this.r.array(60, bool);
  bgm_new = this.r.array(60, bool);
  clear_all = this.r.bool();
  clear_normal = this.r.bool();
  mono_complete = this.r.bool();
  clear_rose = this.r.bool();
  failure_space = this.r.bool();
  mono_get = this.r.array(3501, bool);
  mono_new = this.r.array(3501, bool);
  ouji_get = this.r.array(40, bool);
  use_ouji = this.r.pair(i8);
  hiroba_disp_icon = this.r.array(10, u8);
  hiroba_disp_object = this.r.array(11, bool);
  vs_entry_priority = this.r.array(40, u8);
  vs_flower_count = this.r.u8();
  vs_top_ouji_no = this.r.i8();
  vs_top_ouji_cookie = this.r.i16();
  vs_play_count = this.r.u16();
  max_core_size = this.r.u32();
  star_dust_count = this.r.u32();
  rose_count = this.r.u32();
  last_access_star = this.r.i16();
  star = this.r.array(50, (r) => new SaveInfoMission(r));
  chara = this.r.pair((r) => new SaveInfoChara(r));
  vs = this.r.array(40, (r) => new SaveInfoVs(r));
  fan = new SaveInfoFan(this.r);
  favorite_music = new FavoriteMusic(this.r);
  eternal = this.r.triple(u32);
  ending_saw_couunt = this.r.u16();
}

export class SaveInfoMission extends Decodable {
  clear = this.r.bool();
  rank = this.r.i8();
  chara = this.r.pair(i8);
  star_suffix = this.r.i8();
  shooting_star = this.r.bool();
  name = this.r.i16();
  shooting_star_name = this.r.i16();
  shooting_star_time = this.r.i32();
  play_count = this.r.u32();
  record = this.r.array(8, u32);
  best = this.r.pair((r) => new SaveInfoBest(r));
}

export class SaveInfoBest extends Decodable {
  // TODO: Confirm field order
  chara = this.r.pair(i8);
  set = this.r.i8();
  pad = this.r.i8();
  value = this.r.i32();
  time = this.r.i32();
}

export class SaveInfoChara extends Decodable {
  ouji_id = this.r.u8();
  equip = this.r.triple(i8);
}

export class SaveInfoVs extends Decodable {
  cookie = this.r.i16();
  ignore = this.r.i16();
}

export class SaveInfoFan extends Decodable {
  state = this.r.array(30, u8);
  last_rating = this.r.array(30, i8);
  ignore_count = this.r.array(30, u16);
}

export class FavoriteMusic extends Decodable {
  music_ids = this.r.array(10, i8);
  shuffle = this.r.bool();
}

export class SaveInfoTutorial extends Decodable {
  title_1st = this.r.bool();
  hiroba_1st = this.r.bool();
  hiroba_after_tutorial = this.r.bool();
  hiroba_present_1st = this.r.bool();
  hiroba_movie_1st = this.r.bool();
  hiroba_shoting = this.r.bool();
  hiroba_sun_fail = this.r.bool();
  hiroba_sun_ok = this.r.bool();
  hiroba_mono_complete = this.r.bool();
  game_into_omoide = this.r.bool();
  castle_1st = this.r.bool();
  game_1st_makikomi1 = this.r.bool();
  game_1st_kuzure = this.r.bool();
  game_1st_tobashi = this.r.bool();
  game_1st_nige = this.r.bool();
  game_1st_makikomi2 = this.r.bool();
  game_1st_rest = this.r.bool();
  game_1st_coop = this.r.bool();
  game_1st_photo = this.r.bool();
  game_1st_fish = this.r.bool();
  castle_desk_appear = this.r.bool();
  castle_piano_appear = this.r.bool();
  castle_swan_appear = this.r.bool();
  castle_tire_appear = this.r.bool();
  castle_dumbbell_appear = this.r.bool();
  castle_desk_clear1st = this.r.bool();
  castle_piano_clear1st = this.r.bool();
  castle_swan_clear1st = this.r.bool();
  castle_tire_clear1st = this.r.bool();
  castle_dumbbell_clear1st = this.r.bool();
  tips_get = this.r.array(11, bool);
  activity_end = this.r.array(49, bool);
  reserve = this.r.array(11, bool);
}

export class SavePhotoInfo extends Decodable {
  photos = this.r.array(12, (r) => new PhotoInfo(r));
}

export class PhotoInfo extends Decodable {
  position = this.r.pair(i16);
  pri = this.r.u8();
  put_type = this.r.i8();
  type_index = this.r.i8();
  pal = this.r.u8();
  data = this.r.array(2, i16);
  reserve1 = this.r.array(4, u8);
  image = this.r.bytes(150_000);
}

export class SystemData extends Decodable {
  eura_pp_ce = this.r.triple(bool);
  screen_mode_type = this.r.u8();
  resolution_type = this.r.u8();
  vsync = this.r.bool();
  antialiasing = this.r.u8();
  depth_of_field = this.r.bool();
  shadow_quality = this.r.u8();
  bgm_vol = this.r.i8();
  sfx_vol = this.r.i8();
}
