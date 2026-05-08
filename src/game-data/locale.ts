import { Signal, signal } from "@preact/signals";

async function load(signal: Signal<string[]>, url: URL): Promise<void> {
  const response = await fetch(url);
  const text = await response.text();
  signal.value = text.split("\n");
}

export const english = {
  names: signal([]),
  suffixes: signal([]),
  select: signal([]),
};

load(english.names, new URL("./locale/name/english.txt", import.meta.url));
load(english.suffixes, new URL("./locale/suffix/english.txt", import.meta.url));
load(english.select, new URL("./locale/select/english.txt", import.meta.url));
