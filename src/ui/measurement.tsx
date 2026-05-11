import type { JSX } from "preact/jsx-runtime";

export const enum Dimension {
  Length,
  ConciseLength,
  Time,
  Count,
  Percentage,
  Mass,
  Price,
}

export function Measurement(
  props: { value: number; unit: Dimension; extra?: number; className?: string },
): JSX.Element {
  let text: string;
  const n = props.value, extra = props.extra;
  switch (props.unit) {
    case Dimension.Length: {
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
      text = `${n} kg`;
      break;
    }
    case Dimension.Price: {
      text = usdFmt.format(n / 100);
      break;
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

  return <data value={n} className={props.className}>{text}</data>;
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
