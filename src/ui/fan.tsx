import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoGame, SaveInfoMission } from "../save-file.ts";
import { Star } from "./star.tsx";
import { english } from "../game-data/locale.ts";

import "./fan.css";
import { cousinIds, stickerIds } from "../game-data/fans.ts";
import { missions } from "../game-data/missions.ts";

export function Fan(
  props: {
    fanIdx: number;
    missionIdx: number;
    stars: SaveInfoMission[];
    starNames: number[];
    save: SaveInfoGame;
  },
): JSX.Element {
  let imgUrl: URL | null = null;
  let name = "";
  try {
    name = english.names.value[2800 + props.fanIdx];
    imgUrl = new URL(`../assets/fans/${props.fanIdx + 1}.png`, import.meta.url);
  } catch {
    try {
      // Fall back to Royal Reverie icons
      imgUrl = new URL(
        `../assets/fans/k${props.fanIdx - 29}.png`,
        import.meta.url,
      );
      name = english.select.value[233 + props.fanIdx - 30];
    } catch {
      // whatever. Michiru and "Earth" are still acting weird.
    }
  }

  return (
    <>
      <h2>{name}</h2>
      <ol class="stars">
        {props.starNames.map((name, i) =>
          !english.select.value[name]?.includes("Eternal") && (
            <li key={i}>
              <Star
                name={english.select.value[name]}
                data={props.stars[i]}
                info={missions[props.missionIdx][i]}
              />
            </li>
          )
        )}
      </ol>

      <ol class="cousins">
        {cousinIds[props.missionIdx].map((id) => (
          <li
            key={id}
            role="img"
            class="cousin-icon"
            style={`--id: ${id}`}
            data-collected={props.save.ouji_get[id] ? "" : null}
            title={english.names.value[3381 + id]}
          />
        ))}
      </ol>

      <ol class="stickers">
        {stickerIds[props.missionIdx].map((id) => (
          <li
            key={id}
            class="sticker-icon"
            data-collected={props.save.stamp_get[id] ? "" : null}
            title={english.system.value[469 + id]}
          >
            <img
              src={new URL(`../assets/stickers/${id + 1}.png`, import.meta.url)
                .toString()}
            />
          </li>
        ))}
      </ol>

      {imgUrl && <img class="fan-img" src={imgUrl.toString()} />}
    </>
  );
}
