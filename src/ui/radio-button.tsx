import type { Signal } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";

export function RadioButton<T extends string | number>(
  props: {
    name: string;
    id: string;
    label: string;
    value: T;
    bind: Signal<T>;
    extra?: object;
    children?: unknown;
  },
): JSX.Element {
  const { name, id, value } = props;
  return (
    <label for={props.id} {...props.extra}>
      <input
        type="radio"
        checked={props.bind.value === props.value}
        onChange={(event) => {
          if (event.currentTarget.checked) props.bind.value = props.value;
        }}
        {...{ name, id, value }}
      />
      {props.label}
      {props.children}
    </label>
  );
}
