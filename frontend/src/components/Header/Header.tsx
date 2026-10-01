import { memo } from "react";
import type { SortOrder } from "../../types/types";
import { AddGif } from "../AddGif/AddGif";
import "./Header.scss";

type HeaderProps = {
  onSave: (formData: FormData) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
};

export const Header = memo(
  ({ onSave, sortOrder, onToggleSortOrder }: HeaderProps) => {
    return (
      <div className="button-container align-right ">
        <AddGif onSave={onSave}></AddGif>
        <button onClick={onToggleSortOrder} aria-label="SortOrder">
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    );
  },
);
