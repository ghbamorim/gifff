import type { SortOrder } from "../types/types";
import "./Header.scss";
import { memo, type ChangeEvent } from "react";

const MAX_UPLOAD_SIZE = 120 * 1024 * 1024; // 20 MiB

type HeaderProps = {
  onSave: (formData: FormData) => void;
  sortOrder: SortOrder;
  onTogleSortOrder: () => void;
};

export const Header = memo(
  ({ onSave, sortOrder, onTogleSortOrder }: HeaderProps) => {
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) {
        return;
      }

      const totalSize = files.reduce((total, file) => total + file.size, 0);

      if (totalSize >= MAX_UPLOAD_SIZE) {
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
      <div className="button-container align-right ">
        <input
          id="gif-file"
          className="file-input"
          type="file"
          multiple
          accept="image/gif, video/mp4"
          onChange={handleFileChange}
        ></input>
        <label htmlFor="gif-file" className="add-button">
          +
        </label>
        <button onClick={onTogleSortOrder}>
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    );
  },
);
