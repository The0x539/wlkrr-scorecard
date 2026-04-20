import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

import { PhotoInfo } from "../save-file.ts";
import { fileState } from "./scorecard.tsx";

import type { JSX } from "preact/jsx-runtime";

export function Album(): JSX.Element {
  const photos = fileState.save.value!.photo_info.photos;
  return <ul>{photos.map(ShowPhoto)}</ul>;
}

function ShowPhoto(photo: PhotoInfo): JSX.Element {
  const blobURL = useSignal("");

  useEffect(() => {
    if (photo.image.length > 0) {
      // if this assertion fails, it indicates a memory leak,
      // as the old object URL has not been revoked
      console.assert(blobURL.value === "");

      const blob = new Blob([photo.image], { type: "image/jpeg" });
      blobURL.value = URL.createObjectURL(blob);
    }

    return () => {
      if (blobURL.value !== "") {
        URL.revokeObjectURL(blobURL.value);
        blobURL.value = "";
      }
    };
  }, [photo]);

  return (
    <>
      {blobURL.value && <img src={blobURL.value} />}
    </>
  );
}
