import { computed, signal } from "@preact/signals";
import { loadBinary, loadText } from "./data.ts";

const sizeData = signal(new ArrayBuffer());
const categoryData = signal(new ArrayBuffer());
const nameData = signal<string[]>([]);

loadBinary(sizeData, new URL("./things/sizes.bin", import.meta.url));
loadBinary(categoryData, new URL("./things/categories.bin", import.meta.url));
loadText(nameData, new URL("./things/names.txt", import.meta.url));

export default computed(() => {
  return ({
    sizes: new Uint32Array(sizeData.value),
    categories: new Uint8Array(categoryData.value),
    names: nameData.value,
  });
});
