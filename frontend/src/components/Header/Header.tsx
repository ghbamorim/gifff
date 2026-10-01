import { memo } from "react";
import type { SortOrder } from "../../types/types";
import { AddGif } from "../AddGif/AddGif";
import "./Header.scss";

type HeaderProps = {
  onSave: (formData: FormData) => void;
  sortOrder: SortOrder;
  onTogleSortOrder: () => void;
};

export const Header = memo(
  ({ onSave, sortOrder, onTogleSortOrder }: HeaderProps) => {
    return (
      <div className="button-container align-right ">
        <AddGif onSave={onSave}></AddGif>
        <button onClick={onTogleSortOrder} aria-label="SortOrder">
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    );
  },
);
