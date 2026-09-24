import "./GifTable.scss";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import type { Gif, SortOrder } from "../../types/types";

type GifTableProps = {
  gifs: Gif[];
  sortOrder: SortOrder;
  onTogleSortOrder: () => void;
  onDelete: (id: number) => void;
  onLoadMore: () => void;
};

export const GifTable = ({
  gifs,
  onTogleSortOrder,
  onDelete,
  sortOrder,
  onLoadMore,
}: GifTableProps) => {
  return (
    <>
      <div>
        <button onClick={onTogleSortOrder}>
          Order: {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
      {gifs.map((gif) => (
        <GifTableItem key={gif.id} gif={gif} onDelete={onDelete}></GifTableItem>
      ))}
      <button onClick={onLoadMore}>Load more</button>
    </>
  );
};
