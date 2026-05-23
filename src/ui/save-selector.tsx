import type { JSX } from "preact";
import type { Signal } from "@preact/signals";

import "./save-selector.css";

export function SaveSelector(
  props: { chosenSlot: Signal<number> },
): JSX.Element {
  const slots = ["na", "m", "co"];
  return (
    <div role="presentation" class="save-selector">
      {slots.map((s, i) => (
        <div role="presentation" class="save-slot">
          <label for={`slot-${s}`}>{s}</label>
          <input
            name="slot"
            id={`slot-${s}`}
            type="radio"
            value={s}
            checked={props.chosenSlot.value === i}
            onChange={() => props.chosenSlot.value = i}
          />
        </div>
      ))}
      <img />
    </div>
  );
}
