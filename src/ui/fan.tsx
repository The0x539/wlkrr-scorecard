import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";
import { Star } from "./star.tsx";
import { english } from "../game-data/locale.ts";

import "./fan.css";

export function Fan(
  props: { index: number; stars: SaveInfoMission[]; starNames: number[] },
): JSX.Element {
  let imgUrl: URL | null = null;
  let name = "";
  try {
    name = english.names.value[2800 + props.index];
    imgUrl = new URL(`../assets/fans/${props.index + 1}.png`, import.meta.url);
  } catch {
    try {
      // Fall back to Royal Reverie icons
      imgUrl = new URL(
        `../assets/fans/k${props.index - 29}.png`,
        import.meta.url,
      );
      name = english.select.value[233 + props.index - 30];
    } catch {
      // whatever. Michiru and "Earth" are still acting weird.
    }
  }

  return (
    <>
      <h2>{name}</h2>
      <ol class="stars">
        {props.starNames.map((name, i) => (
          <li key={i}>
            <Star
              name={english.select.value[name]}
              data={props.stars[i]}
            />
          </li>
        ))}
      </ol>

      {imgUrl && <img class="fan-img" src={imgUrl.toString()} />}
    </>
  );
}
