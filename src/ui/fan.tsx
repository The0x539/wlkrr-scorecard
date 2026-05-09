import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";
import { Star } from "./star.tsx";
import { english } from "../game-data/locale.ts";

export function Fan(
  props: { name: string; stars: SaveInfoMission[]; starNames: number[] },
): JSX.Element {
  return (
    <>
      <h2>{props.name}</h2>
      <ol class="stars">
        {props.starNames.map((name, i) => (
          <li>
            <Star
              name={english.select.value[name]}
              data={props.stars[i]}
            />
          </li>
        ))}
      </ol>
    </>
  );
}
