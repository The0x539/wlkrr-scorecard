import type { Signal } from "@preact/signals";

export async function loadText(
  signal: Signal<string[]>,
  url: URL,
): Promise<void> {
  const response = await fetch(url);
  const text = await response.text();
  signal.value = text.split("\n");
}

export async function loadBinary(
  signal: Signal<ArrayBuffer>,
  url: URL,
): Promise<void> {
  const response = await fetch(url);
  signal.value = await response.arrayBuffer();
}
