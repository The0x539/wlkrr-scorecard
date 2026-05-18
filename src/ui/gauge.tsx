import type { JSX } from "preact/jsx-runtime";
import { Dimension, Measurement } from "./measurement.tsx";

import "./gauge.css";

export function Gauge(
  props: {
    value: number;
    ranks?: number[];
    rankRanks?: number[];
    meteor?: number;
    max?: number;
    unit: Dimension;
    markUnit?: Dimension;
  },
): JSX.Element {
  const ranks = [...props.ranks ?? []];

  if (props.unit === Dimension.Mass) {
    ranks.splice(0, 3);
    for (const i in ranks) {
      ranks[i] /= 10;
    }
  }

  let low = ranks[1];
  let high: number | undefined = ranks[ranks.length - 1];
  if (ranks[0] === 1798200) {
    ranks.shift();
  }

  let max = props.max;
  if (ranks.length > 0 && !max) {
    max = ranks.reduce((a, b) => Math.max(a, b)) * 1.25;
  }

  const markUnit = props.markUnit ?? props.unit;

  let optimum = max;
  if (props.unit === Dimension.Time) {
    optimum = 0;
    if (props.meteor) {
      low = props.meteor;
      high = undefined;
    } else {
      low = ranks[ranks.length - 1];
      high = ranks[0];
    }
  }

  let meterMax = max;
  let meterValue = props.value;
  if (props.markUnit === Dimension.Percentage) {
    meterMax = 100;
    meterValue = (props.value / max!) * 100;
    optimum = (optimum! / max!) * 100;

    if (high === meterMax) {
      high -= 0.01;
    }
  }

  let labelExtra = max;
  if (props.unit === Dimension.Fireflies) {
    props.value -= 1;
    meterValue = ranks[props.value];
    labelExtra = undefined;
    low = ranks[ranks.length - 5];
    high = ranks[ranks.length - 1] - 1;
  }

  return (
    <figure class="gauge" style={{ "--meter-max": meterMax }}>
      <Measurement
        value={props.value}
        unit={props.unit}
        extra={labelExtra}
      />
      <div role="presentation" class="meter-container">
        <meter
          min="0"
          max={meterMax}
          low={low}
          high={high}
          optimum={optimum}
          value={meterValue}
        />
        {ranks.map((n, i) => {
          let value = n;
          let extra = max;
          if (props.unit === Dimension.Fireflies) {
            value = i;
            extra = n;
          }
          return (
            <figcaption
              key={i}
              class="marker"
              style={{ "--marker-pos": n }}
              data-rank={props.rankRanks?.[i]}
            >
              <Measurement
                value={value}
                unit={markUnit}
                className="marker-text"
                extra={extra}
              />
            </figcaption>
          );
        })}
        {props.meteor && (
          <figcaption
            key={props.meteor}
            class="marker meteor"
            style={{ "--marker-pos": props.meteor }}
          >
            <Measurement
              value={props.meteor}
              unit={markUnit}
              className="marker-text"
            />
          </figcaption>
        )}
      </div>
    </figure>
  );
}

export function SaturnGauge(
  props: {
    value: number;
    target: number;
    ranks: number[];
  },
): JSX.Element {
  const acceptableRange = props.ranks[0];

  const min = props.target - acceptableRange;
  const max = props.target + acceptableRange;

  const ranks = [];
  for (const margin of props.ranks) {
    if (margin >= acceptableRange) continue;
    ranks.push(props.target - margin, props.target + margin);
  }

  return (
    <figure class="gauge" style={{ "--meter-min": min, "--meter-max": max }}>
      <Measurement
        value={props.value}
        unit={Dimension.Length}
      />
      <div role="presentation" class="meter-container">
        <meter
          min={min}
          max={max}
          low={ranks[ranks.length - 2]}
          high={ranks[ranks.length - 1]}
          optimum={props.target}
          value={props.value}
        />
        {ranks.map((n, i) => (
          <figcaption
            key={i}
            class="marker saturn"
            style={{ "--marker-pos": n }}
          >
            <Measurement
              value={n}
              unit={Dimension.ConciseLength}
              className="marker-text"
            />
          </figcaption>
        ))}
      </div>
    </figure>
  );
}
