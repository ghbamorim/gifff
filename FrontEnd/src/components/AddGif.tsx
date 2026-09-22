import type { ChangeEvent } from "react";

type AddGifProps = {
  onSave: (formData: FormData) => void;
};

export const AddGif = ({ onSave }: AddGifProps) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    onSave(formData);
  };
  return (
    <input
      type="file"
      accept="image/gif, video/mp4"
      onChange={handleFileChange}
    ></input>
  );
};
