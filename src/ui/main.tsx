import { fileState, Scorecard } from "./scorecard.tsx";
import { DropYourSaveFile } from "./drop-your-save-file.tsx";
import { useSignal } from "@preact/signals";

import type { JSX } from "preact/jsx-runtime";
import { Menu, type Mode } from "./menu.tsx";
import { Collection } from "./collection.tsx";

export function Main(): JSX.Element {
  const save = fileState.save.value;
  if (!save) {
    return <DropYourSaveFile />;
  }

  const chosenSlot = useSignal(-1);
  const chosenMode = useSignal<Mode>("scorecard");
  const fanOrder = useSignal<"cosmos" | "meadow">("cosmos");

  if (chosenSlot.value === -1) {
    chosenSlot.value = save.indexOfNewestSave();
  }
  const slot = save.users[chosenSlot.value];

  return (
    <>
      {chosenMode.value === "scorecard" && (
        <Scorecard save={slot} meadowOrder={fanOrder.value === "meadow"} />
      )}
      {chosenMode.value === "collection" && <Collection save={slot} />}
      <Menu {...{ chosenMode, chosenSlot, fanOrder }} />
    </>
  );
}
