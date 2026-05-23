import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoGame, SaveInfoMission } from "../save-file.ts";
import { Star } from "./star.tsx";
import { english } from "../game-data/locale.ts";

import "./fan.css";
import { cousinIds, stickerIds } from "../game-data/fans.ts";
import { missions } from "../game-data/missions.ts";

import presentImg from "../assets/present.png";

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

  // No idea why "apprehended" and "apprehended size" are represented as secondary/tertiary requests for the Cowbear Farmer.
  // Weird hack in the game itself begets a weird hack in this project.
  if (missions[props.missionIdx][0].proc === 12) {
    props.starNames = [props.starNames[0]];
  }

  const presentIds: number[] = [];
  for (const i in props.starNames) {
    const mission = missions[props.missionIdx][i];
    const n = mission.present;
    if (n >= 0 && !presentIds.includes(n)) {
      presentIds.push(n);
    }
  }

  return (
    <>
      <h2>{name}</h2>
      <ol class="stars">
        {props.starNames.map((nameId, i) => {
          const name = english.select.value[nameId];
          return name && !name.includes("Eternal") && (
            <li key={i}>
              <Star
                name={english.select.value[nameId]}
                data={props.stars[i]}
                info={missions[props.missionIdx][i]}
              />
            </li>
          );
        })}
      </ol>

      <ol class="collectibles">
        {presentIds.map((id) => (
          <li
            key={id}
            class="present-icon"
            data-id={id}
            data-collected={props.save.present[id] ? "" : null}
            title={english.present.value[id].replaceAll("・", "")}
          >
            <img src={presentImg} />
          </li>
        ))}

        {cousinIds[props.missionIdx].map((id) => (
          <li
            key={id}
            role="img"
            class="cousin-icon"
            data-id={id}
            style={`--id: ${id}`}
            data-collected={props.save.ouji_get[id] ? "" : null}
            title={english.names.value[3381 + id]}
          />
        ))}

        {stickerIds[props.missionIdx].map((id) => (
          <li
            key={id}
            class="sticker-icon"
            data-id={id}
            data-collected={props.save.stamp_get[id] ? "" : null}
            title={english.system.value[440 + id]}
          >
            <img
              src={new URL(
                `../assets/stickers/${id + 1}.png`,
                import.meta.url,
              )
                .toString()}
            />
          </li>
        ))}
      </ol>

      {imgUrl && <img class="fan-img" src={imgUrl.toString()} />}
    </>
  );
}
