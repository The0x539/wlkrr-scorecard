import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";
import { Star } from "./star.tsx";
import { english } from "../game-data/locale.ts";

import "./fan.css";

export function Fan(
  props: { index: number; stars: SaveInfoMission[]; starNames: number[] },
): JSX.Element {
  // Something's going wrong with Michiru and the mission labeled "Earth".

  let imgUrl: URL | null = null;
  if (props.index <= 28) {
    imgUrl = new URL(`../assets/fans/${props.index + 1}.png`, import.meta.url);
  } else {
    console.log(props.index);
    // imgUrl = new URL(
    // `../assets/fans/k${props.index - 28}.png`,
    //   import.meta.url,
    // );
  }

  return (
    <>
      <h2>{english.names.value[2800 + props.index]}</h2>
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
