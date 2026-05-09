import type { JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";

export function Star(
  props: { name: string; data: SaveInfoMission },
): JSX.Element {
  const records = [...props.data.record];
  while (records[records.length - 1] === 0) {
    records.pop();
  }

  // this seems to be incorrect
  //const name = english.names.value[star.name] + ' ' + english.suffixes.value[star.star_suffix];

  return (
    <>
      <h3>{props.name}</h3>
      <dl>
        <dt>Rank</dt>
        <dd>{props.data.rank}</dd>

        {records.length > 0 && (
          <>
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
          </>
        )}
      </dl>
    </>
  );
}

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
