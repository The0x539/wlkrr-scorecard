import { Signal, signal } from "@preact/signals";

import { loadText } from "./data.ts";

function make(url: URL): Signal<string[]> {
  const s = signal([]);
  loadText(s, url);
  return s;
}

export const english = {
  names: make(new URL("./locale/name/english.txt", import.meta.url)),
  suffixes: make(new URL("./locale/suffix/english.txt", import.meta.url)),
  select: make(new URL("./locale/select/english.txt", import.meta.url)),
  system: make(new URL("./locale/system/english.txt", import.meta.url)),
  star_general: make(new URL("./locale/general/english.txt", import.meta.url)),
  star_special: make(new URL("./locale/special/english.txt", import.meta.url)),
  present: make(new URL("./locale/present/english.txt", import.meta.url)),
  comment: make(new URL("./locale/comment/english.txt", import.meta.url)),
  category: make(new URL("./locale/category/english.txt", import.meta.url)),
};
