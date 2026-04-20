import { effect, signal } from "@preact/signals";

import SaveFile from "../save-file.ts";
import decrypt from "../decrypt.ts";

import type { JSX } from "preact";
import { Album } from "./album.tsx";

export function Scorecard(): JSX.Element {
  if (!fileState.save.value) return <></>;

  return (
    <>
      <Album />
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
