import type { JSX } from "preact";
import { Signal } from "@preact/signals";

import "./save-selector.css";

export function SaveSelector(selection: Signal<number>): JSX.Element {
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
            checked={selection.value === i}
            onChange={() => selection.value = i}
          />
        </div>
      ))}
      <img />
    </div>
  );
}
