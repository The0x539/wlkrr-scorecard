import { Fragment, type JSX } from "preact/jsx-runtime";
import type { SaveInfoMission } from "../save-file.ts";
import { type MissionInfo, rankTable } from "../game-data/missions.ts";
import { Gauge } from "./gauge.tsx";
import { Dimension, Measurement } from "./measurement.tsx";

export function Star(
  props: { name: string; data: SaveInfoMission; info: MissionInfo },
): JSX.Element {
  const records = [...props.data.record];
  while (records[records.length - 1] === 0) {
    records.pop();
  }

  // TODO: Half of this seems to be incorrect
  //const name = english.names.value[star.name] + ' ' + english.suffixes.value[star.star_suffix];

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

  return (
    <>
      <h3>{props.name}</h3>
      {gauges}
    </>
  );
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
