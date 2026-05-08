import { effect, signal } from "@preact/signals";

import SaveFile from "../save-file.ts";
import decrypt from "../decrypt.ts";

import type { JSX } from "preact";

import { select } from "../game-data/locale.ts";
import { recordCategoryId } from "../game-data/fans.ts";
import { missions } from "../game-data/missions.ts";

const durFmt = new Intl.DurationFormat(undefined, {
  style: "digital",
  hours: "narrow", // otherwise minutes get zero-padded
  hoursDisplay: "auto",
});

function record(n: number, i: number): string {
  if (i === 0) {
    const parts = [];
    if (n >= 1000) {
      const meters = Math.floor(n / 1000);
      parts.push(meters + "m");
    }
    const cm = Math.floor((n % 1000) / 10);
    parts.push(cm + "cm");
    const mm = n % 10;
    parts.push(mm + "mm");
    return parts.join(" ");
  } else if (i === 1) {
    const milliseconds = Math.floor(n * 1000 / 30);
    let dur = Temporal.Duration.from({ milliseconds });
    dur = dur.round({ largestUnit: "minute" });
    return durFmt.format(dur);
  } else {
    return n.toString();
  }
}

export function Scorecard(): JSX.Element {
  const save = fileState.save.value;
  if (!save) {
    return (
      <>
        No save file loaded.
      </>
    );
  }

  const slot = save.users[0];
  const game = slot.game;

  const list: JSX.Element[] = [];
  for (const i in recordCategoryId) {
    const sublist: JSX.Element[] = [];
    for (const j in recordCategoryId[i]) {
      const name = select.value[recordCategoryId[i][j]];
      const info = missions[i][j];

      if (info.star === 0) continue;
      const star = game.star[info.star];

      const records = [...star.record];
      while (records[records.length - 1] === 0) {
        records.pop();
      }

      // this seems to be incorrect
      //const name = names.value[star.name] + ' ' + suffixes.value[star.star_suffix];

      sublist.push(
        <li>
          {name}
          <dl>
            <dt>Record</dt>
            <dd>
              <ol>
                {records.map((n, i) => (
                  <li key={i}>
                    {record(n, i)}
                  </li>
                ))}
              </ol>
            </dd>

            <dt>Rank</dt>
            <dd>{star.rank}</dd>
          </dl>
        </li>,
      );
    }
    if (sublist.length === 0) continue;
    list.push(<ol>{sublist}</ol>);
  }

  return (
    <>
      <ol class="missions">
        {list}
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
