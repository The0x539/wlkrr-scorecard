import type { JSX } from "preact";

import "./drop-your-save-file.css";

export function DropYourSaveFile(): JSX.Element {
  const parts = ["d", "ro", "p", "you", "r", "s", "a", "ve", "f", "i", "le"];
  return (
    <div role="presentation" class="letters-container">
      {parts.map((part, i) => {
        const path = new URL(`../assets/letters/${part}.png`, import.meta.url)
          .toString();
        return (
          <span key={i} role="presentation" class="letter">
            <img key={i} alt={part} src={path} />
          </span>
        );
      })}
    </div>
  );
}
