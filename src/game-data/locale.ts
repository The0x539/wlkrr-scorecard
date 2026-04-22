export type Language =
  | "ja"
  | "en"
  | "fr"
  | "de"
  | "it"
  | "es"
  | "ko"
  | "zht"
  | "zhs";

export type LocalizationDigest = Record<string, Record<Language, string>>;
