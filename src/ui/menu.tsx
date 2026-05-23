import type { Signal } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";
import { SaveSelector } from "./save-selector.tsx";

export type Mode = "scorecard" | "collection";

import "./menu.css";

export function Menu(
  props: {
    chosenMode: Signal<Mode | undefined>;
    chosenSlot: Signal<number>;
    meadowOrder: Signal<boolean>;
  },
): JSX.Element {
  const { chosenMode, chosenSlot, meadowOrder } = props;
  return (
    <div role="menu">
      <SaveSelector chosenSlot={chosenSlot} />

      <fieldset role="radiogroup">
        <legend>Mode</legend>

        <input
          name="mode"
          id="scorecard-mode"
          type="radio"
          value="scorecard"
          checked={chosenMode.value === "scorecard"}
          onChange={(event) => {
            if (event.currentTarget.checked) chosenMode.value = "scorecard";
          }}
        />
        <label for="scorecard-mode">Scorecard</label>

        <input
          name="mode"
          id="collection-mode"
          type="radio"
          value="collection"
          checked={chosenMode.value === "collection"}
          onChange={(event) => {
            if (event.currentTarget.checked) chosenMode.value = "collection";
          }}
        />
        <label for="collection-mode">Collection</label>
      </fieldset>

      <fieldset role="radiogroup">
        <legend>Fan Order</legend>

        <input
          name="fan-order"
          id="cosmos-order"
          type="radio"
          value="cosmos"
          checked={!meadowOrder.value}
          onChange={(event) => {
            if (event.currentTarget.checked) meadowOrder.value = false;
          }}
        />
        <label for="cosmos-order">Cosmos</label>

        <input
          name="fan-order"
          id="meadow-order"
          type="radio"
          value="meadow"
          checked={meadowOrder.value}
          onChange={(event) => {
            if (event.currentTarget.checked) meadowOrder.value = true;
          }}
        />
        <label for="meadow-order">Meadow</label>
      </fieldset>
    </div>
  );
}
