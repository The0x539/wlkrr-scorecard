import type { JSX } from "preact/jsx-runtime";
import type { SaveInfo } from "../save-file.ts";

export function Collection(props: { save: SaveInfo }): JSX.Element {
  const _game = props.save.game;
  return (
    <>
      <h1>Item Collection</h1>
      <p>TODO</p>
    </>
  );
}
