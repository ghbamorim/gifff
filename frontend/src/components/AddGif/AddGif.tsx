import { memo, type ChangeEvent } from "react";
import "./AddGif.scss";

export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20 MiB

type AddGifProps = {
  onSave: (formData: FormData) => void;
};

export const AddGif = memo(({ onSave }: AddGifProps) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const totalSize = files.reduce((total, file) => total + file.size, 0);

    if (totalSize > MAX_UPLOAD_SIZE) {
      alert(
        `The total size of the files cannot exceed ${MAX_UPLOAD_SIZE} bytes`,
      );
      event.target.value = "";
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    onSave(formData);
  };
  return (
    <>
      <input
        id="gif-file"
        className="file-input"
        type="file"
        multiple
        accept="image/gif, video/mp4"
        onChange={handleFileChange}
        data-testid="gifInput"
      ></input>
      <label htmlFor="gif-file" className="add-button">
        +
      </label>
    </>
  );
});
