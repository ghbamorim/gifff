import { memo } from "react";
import type { SortOrder } from "../../types/types";
import { AddGif } from "../AddGif/AddGif";
import "./Header.scss";

type HeaderProps = {
  onSave: (formData: FormData) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  onLogOff: () => void;
};

export const Header = memo(
  ({ onSave, sortOrder, onToggleSortOrder, onLogOff }: HeaderProps) => {
    return (
      <div className="button-container align-right ">
        <AddGif onSave={onSave}></AddGif>
        <button onClick={onToggleSortOrder} aria-label="SortOrder">
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
        <button onClick={onLogOff} aria-label="Sign out">
          ⏻
        </button>
      </div>
    );
  },
);
