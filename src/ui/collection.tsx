import type { JSX } from "preact/jsx-runtime";
import type { SaveInfo } from "../save-file.ts";
import type { Signal } from "@preact/signals";
import type { RefObject } from "preact";
import type { Inputs } from "preact/hooks";

import thingsData from "../game-data/things.ts";
import { english } from "../game-data/locale.ts";
import { Dimension, Measurement } from "./measurement.tsx";
import { useSignal } from "@preact/signals";
import { RadioButton } from "./radio-button.tsx";

import "./collection.css";
import { useLayoutEffect, useRef } from "preact/hooks";

const EVERYTHING = -1, REMAINING = -2;

export function Collection(props: { save: SaveInfo }): JSX.Element {
  const game = props.save.game;
  const things = thingsData.value;

  const currentCategory = useSignal(1);

  const categoryCounts = Array(93).fill(null).map(() => ({
    total: 0,
    collected: 0,
  }));
  const overallCount = { total: 0, collected: 0 };

  const thingList: JSX.Element[] = [];
  for (let i = 0; i < 3501; i++) {
    const category = things.categories[i];
    if (category === 0) continue;

    const cosmic = category === 91 || category === 92;
    const collected = game.mono_get[i];

    overallCount.total += 1;
    categoryCounts[category].total += 1;
    overallCount.collected += +collected;
    categoryCounts[category].collected += +collected;

    let show = true;
    if (currentCategory.value >= 0) {
      show = category === currentCategory.value;
    } else if (currentCategory.value === EVERYTHING) {
      show = category !== 0;
    } else if (currentCategory.value === REMAINING) {
      show = !collected;
    }

    if (!show) {
      continue;
    }

    thingList.push(
      <li
        key={i}
        data-index={i}
        data-id={things.ids[i]}
        data-category={category}
        data-collected={collected ? "" : null}
      >
        {english.names.value[i]}
        {collected ? "✔️" : "❌"}
        {!cosmic && (
          <Measurement
            value={things.sizes[i]}
            unit={Dimension.Length}
            no-icon
          />
        )}
        {english.category.value[category]}
        <p>{english.comment.value[i]}</p>
      </li>,
    );
  }

  const hackRef = useRef<HTMLUListElement>(null);
  useWidthHack(hackRef, [thingList]);

  return (
    <>
      <ul class="collection-list width-hack" ref={hackRef}>
        {thingList}
      </ul>

      <div role="presentation" class="category-picker-container">
        <CategoryPicker
          {...{ currentCategory, overallCount, categoryCounts }}
        />
      </div>
    </>
  );
}

type Counts = { collected: number; total: number };

function CategoryPicker(
  props: {
    currentCategory: Signal<number>;
    overallCount: Counts;
    categoryCounts: Counts[];
  },
): JSX.Element {
  const { currentCategory, overallCount, categoryCounts } = props;

  const complete = ({ collected, total }: Counts) => ({
    "data-complete": collected === total ? "" : null,
  });

  const hackRef = useRef<HTMLFieldSetElement>(null);
  useWidthHack(hackRef, []);

  return (
    <fieldset
      role="radiogroup"
      class="category-picker width-hack"
      ref={hackRef}
    >
      <RadioButton
        name="category"
        id="category-everything"
        value={EVERYTHING}
        bind={currentCategory}
        extra={complete(overallCount)}
        label="Everything"
      >
        <Measurement
          value={overallCount.collected}
          unit={Dimension.Count}
          extra={overallCount.total}
        />
      </RadioButton>

      <RadioButton
        name="category"
        id="category-remaining"
        value={REMAINING}
        bind={currentCategory}
        extra={complete(overallCount)}
        label="Remaining"
      >
        <Measurement
          value={overallCount.total - overallCount.collected}
          unit={Dimension.Count}
          extra={overallCount.total}
        />
      </RadioButton>

      {categoryCounts.map(({ collected, total }, i) =>
        i !== 0 && (
          <RadioButton
            name="category"
            id={`category-${i}`}
            value={i}
            bind={currentCategory}
            extra={complete({ collected, total })}
            label={english.category.value[i] || "Dummy"}
          >
            <Measurement
              value={collected}
              unit={Dimension.Count}
              extra={total}
            />
          </RadioButton>
        )
      )}
    </fieldset>
  );
}

// https://bugzilla.mozilla.org/show_bug.cgi?id=995020
function useWidthHack(elemRef: RefObject<HTMLElement>, inputs: Inputs): void {
  useLayoutEffect(() => {
    const elem = elemRef.current!;
    elem.style.width = "";
    if (!requiresWidthHack(elem)) return;

    performWidthHack(elem);

    const handler = () => performWidthHack(elem);
    addEventListener("resize", handler);
    return () => removeEventListener("resize", handler);
  }, inputs);
}

function requiresWidthHack(elem: HTMLElement): boolean {
  const outer = elem.getBoundingClientRect();
  const last = elem.lastElementChild!.getBoundingClientRect();
  return outer.right < last.right;
}

function performWidthHack(elem: HTMLElement): void {
  const first = elem.firstElementChild!.getBoundingClientRect();
  const last = elem.lastElementChild!.getBoundingClientRect();
  const newWidth = last.right - first.left;
  elem.style.width = newWidth + "px";
}
