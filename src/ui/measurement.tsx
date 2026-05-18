import type { JSX } from "preact/jsx-runtime";
import { english } from "../game-data/locale.ts";

export const enum Dimension {
  Length,
  ConciseLength,
  Time,
  Count,
  Percentage,
  Mass,
  Price,
  Fireflies,
  AstronomicalLength,
}

export function Measurement(
  props: {
    value: number;
    unit: Dimension;
    extra?: number;
    className?: string;
    ["no-icon"]?: boolean;
  },
): JSX.Element {
  let text: string;
  let unit: string | null = null;
  const n = props.value, extra = props.extra;
  switch (props.unit) {
    case Dimension.Length: {
      unit = "mm";
      const parts = [];
      if (n >= 1000) {
        const meters = Math.floor(n / 1000);
        parts.push(meters + "m");
      }
      const cm = Math.floor((n % 1000) / 10);
      parts.push(cm + "cm");
      const mm = n % 10;
      parts.push(mm + "mm");
      text = parts.join(" ");
      break;
    }
    case Dimension.ConciseLength: {
      unit = "mm";
      if (n >= 1_000_000) {
        text = `${n / 1_000_000}km`;
      } else if (n >= 1_000) {
        text = `${n / 1_000}m`;
      } else if (n >= 10) {
        text = `${n / 10}cm`;
      } else {
        text = `${n}mm`;
      }
      break;
    }
    case Dimension.Time: {
      const milliseconds = Math.floor(n * 1000 / 30);
      if (milliseconds !== milliseconds) {
        return <>NaN</>;
      }
      let dur = Temporal.Duration.from({ milliseconds });
      dur = dur.round({ largestUnit: "minute" });
      return (
        <time dateTime={dur.toString()} className={props.className}>
          {durFmt.format(dur)}
        </time>
      );
    }
    case Dimension.Percentage: {
      if (extra) {
        const fraction = n / 100;
        const amount = Math.ceil(fraction * extra);
        text = `${n}% (${amount})`;
      } else {
        text = `${n}%`;
      }
      break;
    }
    case Dimension.Mass: {
      unit = "kg";
      text = `${n} kg`;
      break;
    }
    case Dimension.Price: {
      unit = "$";
      text = usdFmt.format(n / 100);
      break;
    }
    case Dimension.Fireflies: {
      unit = "light";
      text = english.select.value[n + 13];
      if (props.extra) {
        text += ` (${props.extra})`;
      }
      break;
    }
    case Dimension.AstronomicalLength: {
      const [mantissa, exponent] = n.toExponential(3).split(/e\+?/);
      // milli-earths
      return (
        <data value={n} data-unit="m♁" className={props.className}>
          <math>
            <mrow>
              <mn>{mantissa}</mn>
              <mo>&middot;</mo>
              <msup>
                <mn>10</mn>
                <mn>{exponent}</mn>
              </msup>
              <mo rspace="thickmathspace">&#x2062;</mo>
              <mi mathvariant="normal">m</mi>
            </mrow>
          </math>
        </data>
      );
    }
    case Dimension.Count:
    default: {
      if (extra) {
        const fraction = n / extra;
        const percentage = Math.round(fraction * 100);
        text = `${n} / ${extra} (${percentage}%)`;
      } else {
        text = `${n}`;
      }
      break;
    }
  }

  return (
    <data value={n} data-unit={unit} className={props.className}>{text}</data>
  );
}

const durFmt = new Intl.DurationFormat(undefined, {
  style: "digital",
  hours: "narrow", // otherwise minutes get zero-padded
  hoursDisplay: "auto",
});

const usdFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});
