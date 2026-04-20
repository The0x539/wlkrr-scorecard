import { fileState } from "./ui/scorecard.tsx";

export async function handleFolder(
  folder: FileSystemDirectoryEntry,
): Promise<void> {
  const candidates = [];
  for await (const candidate of findKatamariSave(folder)) {
    candidates.push(candidate);
  }

  if (candidates.length === 0) return;

  // assume the most recently modified file is the one you want to look at
  // (to be improved later maybe)
  candidates.sort((a, b) => b.lastModified - a.lastModified);
  fileState.setSource(candidates[0]);
}

// Chromium doesn't expose the FSDE class for *some reason*.
export function isDirectory(
  entry: FileSystemEntry | null,
): entry is FileSystemDirectoryEntry {
  if (!entry) return false;

  if (window.FileSystemDirectoryEntry) {
    return entry instanceof FileSystemDirectoryEntry;
  } else {
    return entry.isDirectory;
  }
}

async function* findKatamariSave(
  parent: FileSystemDirectoryEntry,
  name?: string,
): AsyncGenerator<File> {
  name ??= parent.name;

  if (name === "Users" || name === "SaveGames") {
    const pseudoName = name === "Users" ? "<user>" : "<steam>";
    for (const child of await readDir(parent)) {
      if (isDirectory(child)) {
        yield* findKatamariSave(child, pseudoName);
      }
    }
    return;
  }

  const path = [
    "C:",
    "Users",
    "<user>",
    "AppData",
    "Local",
    "BANDAI NAMCO Entertainment",
    "We Love Katamari REROLL+ Royal Reverie",
    "Saved",
    "SaveGames",
    "<steam>",
  ];

  const i = path.indexOf(name);
  if (i < 0) {
    // dead end / unrecognized path
    return;
  } else if (i + 1 < path.length) {
    try {
      const child = await getDir(parent, path[i + 1]);
      yield* findKatamariSave(child);
    } catch { /**/ }
  } else {
    const entry = await getFile(parent, "KD2SaveData.bin");
    yield await asFile(entry);
  }
}

function asFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((s, e) => entry.file(s, e));
}

function getFile(
  dir: FileSystemDirectoryEntry,
  name: string,
): Promise<FileSystemFileEntry> {
  return new Promise((s, e) =>
    dir.getFile(name, undefined, s as FileSystemEntryCallback, e)
  );
}

function getDir(
  dir: FileSystemDirectoryEntry,
  name: string,
): Promise<FileSystemDirectoryEntry> {
  return new Promise((s, e) =>
    dir.getDirectory(name, undefined, s as FileSystemEntryCallback, e)
  );
}

function readDir(
  dir: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> {
  const reader = dir.createReader();
  return new Promise((s, e) => reader.readEntries(s, e));
}
