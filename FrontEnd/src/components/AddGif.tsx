import type { ChangeEvent } from "react";
import { url } from "../pages/Gifs/GifPage";

type AddGifProps = {
  onSaved: () => void;
};

export const AddGif = ({ onSaved }: AddGifProps) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(url, { method: "POST", body: formData });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    onSaved();
  };
  return (
    <input type="file" accept="image/gif" onChange={handleFileChange}></input>
  );
};
