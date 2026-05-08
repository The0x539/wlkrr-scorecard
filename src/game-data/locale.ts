import { Signal, signal } from "@preact/signals";

async function load(signal: Signal<string[]>, url: URL): Promise<void> {
  const response = await fetch(url);
  const text = await response.text();
  signal.value = text.split("\n");
}

export const names = signal([]);
load(names, new URL("./locale/name/english.txt", import.meta.url));

export const suffixes = signal([]);
load(suffixes, new URL("./locale/suffix/english.txt", import.meta.url));

export const select = signal([]);
load(select, new URL("./locale/select/english.txt", import.meta.url));
