import type { JSX } from "preact/jsx-runtime";
import type { SaveInfo } from "../save-file.ts";
import type { Signal } from "@preact/signals";

import thingsData from "../game-data/things.ts";
import { english } from "../game-data/locale.ts";
import { Dimension, Measurement } from "./measurement.tsx";
import { useSignal } from "@preact/signals";
import { RadioButton } from "./radio-button.tsx";

import "./collection.css";

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

  return (
    <>
      <ul class="collection-list">
        {thingList}
      </ul>

      <CategoryPicker {...{ currentCategory, overallCount, categoryCounts }} />
    </>
  );
}

function CategoryPicker(
  props: {
    currentCategory: Signal<number>;
    overallCount: Counts;
    categoryCounts: Counts[];
  },
): JSX.Element {
  const { currentCategory, overallCount, categoryCounts } = props;
  return (
    <fieldset role="radiogroup" class="category-picker">
      <RadioButton
        name="category"
        id="category-everything"
        value={EVERYTHING}
        bind={currentCategory}
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

type Counts = { collected: number; total: number };
