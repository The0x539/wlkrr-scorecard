import { effect, signal, useSignal } from "@preact/signals";

import SaveFile from "../save-file.ts";
import decrypt from "../decrypt.ts";

import type { JSX } from "preact";

import { english } from "../game-data/locale.ts";
import {
  gameFan2Mission,
  gameMission2Fan,
  meadowOrder,
  memoryOrder,
  recordCategoryId,
} from "../game-data/fans.ts";
import { missions } from "../game-data/missions.ts";
import { DropYourSaveFile } from "./drop-your-save-file.tsx";
import { SaveSelector } from "./save-selector.tsx";
import { Fan } from "./fan.tsx";

const useMeadowOrder = signal(true);

export function Scorecard(): JSX.Element {
  const save = fileState.save.value;
  if (!save) {
    return DropYourSaveFile();
  }

  const selectedSlot = useSignal(-1);
  if (selectedSlot.value === -1) {
    selectedSlot.value = save.indexOfNewestSave();
  }

  const slot = save.users[selectedSlot.value];
  const game = slot.game;

  const order = useMeadowOrder.value
    ? meadowOrder.flat().concat(memoryOrder).map((i) => gameFan2Mission[i])
    : gameFan2Mission;

  return (
    <>
      {SaveSelector(selectedSlot)}
      <ol class="fans">
        {order.map((i) => (
          <li key={i}>
            <Fan
              name={english.names.value[2800 + gameMission2Fan[i]]}
              stars={missions[i].map((info) => game.star[info.star])}
              starNames={recordCategoryId[i]}
            />
          </li>
        ))}
      </ol>
    </>
  );
}

class FileState {
  private readonly source = signal<File | null>(null);
  readonly save = signal<SaveFile | null>(null);

  setSource(file: File | null | undefined): void {
    if (file) this.source.value = file;
  }

  constructor() {
    // Whenever the picked file (the read method's only subscription) changes,
    // unconditionally reload the data from file.
    effect(() => void this.read().then((save) => this.save.value = save));

    /*
    // Attempt to automatically refresh the file,
    // but try to check whether it actually changed first.
    setInterval(async () => {
      // https://www.w3.org/TR/FileAPI/#file-section
      // From testing, real world browsers seem to snapshot the modification timestamp, but not the contents.
      // This makes automatic reloading at least *possible*, but we need to load the data and compare it.
      // Fortunately, there's a timestamp within the data,
      const newSave = await this.read();
      if (!newSave) return; // there's no new save to load

      const oldTime = this.save.value?.timestamp();
      const newTime = newSave.timestamp();

      // Skip refresh iff both saves contain the same valid timestamp
      if (oldTime != null && newTime != null && oldTime.equals(newTime)) return;

      this.save.value = newSave;
    }, 10000);
    */
  }

  private async read(): Promise<SaveFile | null> {
    const source = this.source.value;
    if (!source) return null;

    const cipherBuf = await source.arrayBuffer();
    if (cipherBuf.byteLength === 0) return null;

    const buf = await decrypt(cipherBuf);
    const save = new SaveFile(buf);

    return save;
  }
}

export const fileState = new FileState();
