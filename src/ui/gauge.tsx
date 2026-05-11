import type { JSX } from "preact/jsx-runtime";
import { Dimension, Measurement } from "./measurement.tsx";

import "./gauge.css";

export function Gauge(
  props: {
    value: number;
    ranks?: number[];
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

  return (
    <figure class="gauge" style={{ "--meter-max": meterMax }}>
      <Measurement
        value={props.value}
        unit={props.unit}
        className="gauge-label"
        extra={max}
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
        {ranks.map((n, i) => (
          <figcaption key={i} class="marker" style={{ "--marker-pos": n }}>
            <Measurement
              value={n}
              unit={markUnit}
              className="marker-text"
              extra={max}
            />
          </figcaption>
        ))}
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
