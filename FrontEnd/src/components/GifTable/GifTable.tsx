import "./GifTable.scss";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import type { Gif, SortOrder } from "../../types/types";

type GifTableProps = {
  gifs: Gif[];
  sortOrder: SortOrder;
  onTogleSortOrder: () => void;
};

export const GifTable = ({
  gifs,
  onTogleSortOrder,
  sortOrder,
}: GifTableProps) => {
  return (
    <>
      <div>
        <button onClick={onTogleSortOrder}>
          Order: {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
      {gifs.map((gif) => (
        <GifTableItem key={gif.id} gif={gif}></GifTableItem>
      ))}
    </>
  );
};
