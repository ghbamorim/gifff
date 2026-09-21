import type { ChangeEvent } from "react";
import { settings } from "../settings";

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

    const response = await fetch(`${settings.apiUrl}/gifs`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    onSaved();
  };
  return (
    <input
      type="file"
      accept="image/gif, video/mp4"
      onChange={handleFileChange}
    ></input>
  );
};
