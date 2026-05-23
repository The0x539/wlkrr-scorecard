import type { Signal } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";
import { SaveSelector } from "./save-selector.tsx";

export type Mode = "scorecard" | "collection";

import "./menu.css";
import { RadioButton } from "./radio-button.tsx";

export function Menu(
  props: {
    chosenMode: Signal<Mode>;
    chosenSlot: Signal<number>;
    fanOrder: Signal<"cosmos" | "meadow">;
  },
): JSX.Element {
  const { chosenMode, chosenSlot, fanOrder } = props;
  return (
    <div role="menu">
      <SaveSelector chosenSlot={chosenSlot} />

      <fieldset role="radiogroup">
        <legend>Mode</legend>

        <RadioButton
          name="mode"
          id="scorecard-mode"
          value="scorecard"
          bind={chosenMode}
          label="Scorecard"
        />

        <RadioButton
          name="mode"
          id="collection-mode"
          value="collection"
          bind={chosenMode}
          label="Collection"
        />
      </fieldset>

      <fieldset role="radiogroup">
        <legend>Fan Order</legend>

        <RadioButton
          name="fan-order"
          id="cosmos-order"
          value="cosmos"
          bind={fanOrder}
          label="Cosmos"
        />

        <RadioButton
          name="fan-order"
          id="meadow-order"
          value="meadow"
          bind={fanOrder}
          label="Meadow"
        />
      </fieldset>
    </div>
  );
}
