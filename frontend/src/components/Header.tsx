import type { SortOrder } from "../types/types";
import "./Header.scss";
import { memo, type ChangeEvent } from "react";

type HeaderProps = {
  onSave: (formData: FormData) => void;
  sortOrder: SortOrder;
  onTogleSortOrder: () => void;
};

export const Header = memo(
  ({ onSave, sortOrder, onTogleSortOrder }: HeaderProps) => {
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
      <div className="button-container align-right ">
        <input
          id="gif-file"
          className="file-input"
          type="file"
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
