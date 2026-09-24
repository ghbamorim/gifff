import "./GifTable.scss";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import type { Gif, SortOrder } from "../../types/types";
import { useEffect, useRef } from "react";

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore]);

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
      <div ref={loadMoreRef} />
    </>
  );
};
