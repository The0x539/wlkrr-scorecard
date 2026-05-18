import { Fragment, type JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";
import { type MissionInfo, rankTable } from "../game-data/missions.ts";
import { Gauge, SaturnGauge } from "./gauge.tsx";
import { Dimension, Measurement } from "./measurement.tsx";
import { english } from "../game-data/locale.ts";
import type { TargetedEvent } from "preact";

export function Star(
  props: { name: string; data: SaveInfoMission; info: MissionInfo },
): JSX.Element {
  const records = [...props.data.record];
  while (records[records.length - 1] === 0) {
    records.pop();
  }

  if (records.length === 0) {
    return <h3>{props.name}</h3>;
  }

  const prefix = getStarName(props.data.name);
  const suffix = english.suffixes.value[props.data.star_suffix];
  const name = (prefix && suffix) ? `${prefix} ${suffix}` : null;

  const ranks = rankTable[props.info.game] ?? [];

  const meteor = props.info.meteor > 0 ? props.info.meteor : undefined;

  const gauges: JSX.Element[] = [];
  switch (objectives.get(props.info.proc)) {
    case Objective.Size:
    case Objective.Campfire:
      gauges.push(
        <Gauge
          value={records[0]}
          ranks={ranks}
          unit={Dimension.Length}
          markUnit={Dimension.ConciseLength}
        />,
        <Gauge
          value={records[1]}
          meteor={meteor}
          unit={Dimension.Time}
          max={props.info.time}
        />,
      );
      break;
    case Objective.OnlyFifty:
      gauges.push(
        <Gauge
          value={records[0]}
          ranks={ranks}
          unit={Dimension.Length}
          markUnit={Dimension.ConciseLength}
        />,
      );
      break;
    case Objective.Sumo:
      gauges.push(
        <Gauge
          value={records[0]}
          ranks={ranks}
          unit={Dimension.Mass}
        />,
        <Gauge
          value={records[1]}
          unit={Dimension.Time}
          max={props.info.time}
        />,
      );
      break;
    case Objective.Many:
    case Objective.Sweets:
    case Objective.Countries:
      gauges.push(
        <Gauge
          value={records[2]}
          ranks={ranks}
          max={records[3]}
          unit={Dimension.Count}
          markUnit={Dimension.Percentage}
        />,
      );
      break;
    case Objective.FastSize:
    case Objective.FastMany:
    case Objective.Every:
      gauges.push(
        <Gauge
          value={records[1]}
          ranks={ranks}
          unit={Dimension.Time}
        />,
      );
      break;
    case Objective.Price:
      gauges.push(
        <Gauge value={records[0]} ranks={ranks} unit={Dimension.Price} />,
      );
      break;
    case Objective.CowBear: {
      const id = records[2];

      const imgSrc = new URL(`../assets/cowbear/${id}.png`, import.meta.url);
      const name = english.names.value[id];
      const size = english.select.value[7 + records[3]];

      gauges.push(
        <figure>
          <img src={imgSrc.toString()} onLoad={setSize} />
          <figcaption>{name} ({size})</figcaption>
        </figure>,
        <Measurement value={records[0]} unit={Dimension.Length} />,
      );
      break;
    }
    case Objective.JustRight:
      gauges.push(
        <SaturnGauge value={records[0]} target={records[3]} ranks={ranks} />,
      );
      break;
    default:
      gauges.push(
        <dl>
          <dt>Rank</dt>
          <dd>
            {props.data.rank}{" "}
            ({ranks.map((n, i) => <Fragment key={i}>{n},</Fragment>)})
          </dd>

          {records.length > 0 && (
            <>
              <dt>Record</dt>
              <dd>
                <ol>
                  {records.map((n, i) => (
                    <li key={i}>
                      <Measurement value={n} unit={Dimension.Count} />
                    </li>
                  ))}
                </ol>
              </dd>
            </>
          )}
        </dl>,
      );
  }

  if (props.data.shooting_star) {
    const prefix = getStarName(props.data.shooting_star_name);
    const suffix = english.suffixes.value[16];
    gauges.push(<>{`${prefix} ${suffix}`}</>);
  }

  return (
    <>
      <h3>{props.name}</h3>
      {name}
      {gauges}
    </>
  );
}

function setSize(event: TargetedEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  img.style.height = `${img.clientHeight / 15}px`;
}

// deno-fmt-ignore
const su8StarNameNumTbl = [
  1, 10, 10, 10, 10, 10, 10, 10, 9, 10,
  10, 10, 10, 10, 10, 10, 10, 10, 8, 8,
  10, 10, 8, 5, 9, 6, 6, 10, 6, 7,
  10, 10, 9, 7, 10, 9, 9, 10, 9, 9,
  5, 6, 6, 10, 6, 8, 7, 5, 10, 6,
  10, 7, 10, 4, 10, 10, 3, 10, 10, 8,
  10, 10, 8, 10, 10, 6, 10, 3, 4, 10,
  10, 10, 8, 6, 1, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10, 1, 7, 10, 10,
  1, 1, 1,
];

const su8StarSpecialNumTbl = [5, 5, 5, 5, 5, 5, 5, 5, 1, 5];

// Why is this so complicated?
// Why wasn't it just storing a direct localization lookup like the suffix?
// The world may never know.
function getStarName(name_id: number): string {
  // This is wrong for:
  // - Cowbear Farmer
  // - Excited Baby
  // This code is assuming type = 0, which is what the prefix part uses.
  const type = name_id >> 12 & 0xf;

  let numTbl: number[];
  let nameTbl: string[];
  if (type === 1) {
    numTbl = su8StarSpecialNumTbl;
    nameTbl = english.star_special.value;
  } else {
    numTbl = su8StarNameNumTbl;
    nameTbl = english.star_general.value;
  }

  const row = name_id >> 4 & 0xff;
  const col = name_id & 0xf;
  let base = numTbl.slice(0, row).reduce((a, b) => a + b, 0);
  if (type === 0) {
    base -= 1; // ???????????????????
  }
  return nameTbl[base + col];
}

export const enum Objective {
  Size,
  Price,
  FastSize,
  Many,
  FastMany,
  Every,
  Fireflies,
  Campfire,
  Sumo,
  Sweets,
  CowBear,
  JustRight,
  Roses,
  OnlyFifty,
  Snowman,
  Countries,
  Tutorial,
  Sun,
  Versus,
}

const objectives = new Map<number, Objective>([
  [1, Objective.Size],
  [2, Objective.Price],
  [3, Objective.FastSize],
  [4, Objective.Many],

  [6, Objective.FastMany],
  [7, Objective.Every],
  [8, Objective.Fireflies],
  [9, Objective.Campfire],
  [10, Objective.Sumo],
  [11, Objective.Sweets],
  [12, Objective.CowBear],
  [13, Objective.JustRight],

  [15, Objective.Roses],
  [16, Objective.OnlyFifty],

  [19, Objective.Snowman],

  [21, Objective.Countries],

  [24, Objective.Tutorial],
  [25, Objective.Sun],
  [26, Objective.Versus],
  // Royal Reverie
  [27, Objective.Size], // Study Time
  [28, Objective.Every], // Ballerina Hunt
  [29, Objective.Many], // Lots of Wheels
  [30, Objective.FastMany], // Extra Special Training
  [31, Objective.Many], // Night School
]);
