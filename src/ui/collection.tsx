import type { JSX } from "preact/jsx-runtime";
import type { SaveInfo } from "../save-file.ts";
import thingsData from "../game-data/things.ts";

import "./collection.css";
import { english } from "../game-data/locale.ts";
import { Dimension, Measurement } from "./measurement.tsx";

const arr: null[] = Array(3501).fill(null);

export function Collection(props: { save: SaveInfo }): JSX.Element {
  console.log(arr.map(() => 5));
  const game = props.save.game;
  const things = thingsData.value;
  return (
    <>
      <ul class="collection-list">
        {arr.map((_, i) => {
          const category = things.categories[i];
          const cosmic = category === 91 || category === 92;

          return (
            <li
              key={i}
              data-index={i}
              data-id={things.names[i]}
              data-category={category}
            >
              {english.names.value[i]}
              {game.mono_get[i] ? "✔️" : "❌"}
              {!cosmic && (
                <Measurement
                  value={things.sizes[i]}
                  unit={Dimension.Length}
                  no-icon
                />
              )}
              {english.category.value[category]}
              <p>{english.comment.value[i]}</p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
