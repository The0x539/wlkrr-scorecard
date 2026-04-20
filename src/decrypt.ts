const key: CryptoKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("y8iW6LAG3cLhM6hS"),
  "AES-CBC",
  false,
  ["decrypt"],
);
const iv: BufferSource = new TextEncoder().encode("g6GUhUg7yASzRCkS");

export default async function decrypt(
  ciphertext: ArrayBuffer,
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, ciphertext);
}
