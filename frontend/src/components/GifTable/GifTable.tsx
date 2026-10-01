import { useEffect, useRef } from "react";
import type { Gif, PageStatus } from "../../types/types";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import "./GifTable.scss";

type GifTableProps = {
  gifs: Gif[];
  onDelete: (id: number) => void;
  onLoadMore: () => void;
  status: PageStatus;
  error: string | null;
};

export const GifTable = ({
  gifs,
  onDelete,
  onLoadMore,
  status,
  error,
}: GifTableProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const renderStatus = () => {
    switch (status) {
      case "loading":
        return <div>Loading</div>;

      case "saving":
        return <div>Saving</div>;

      case "deleting":
        return <div>Deleting</div>;

      case "error":
        return <div>{error}</div>;
      default:
        break;
    }
  };

  useEffect(() => {
    const element = loadMoreRef.current;
    /* v8 ignore if -- @preserve */
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
      {renderStatus()}
      <div className="gif-grid" data-testid="GifTable">
        {gifs.map((gif) => (
          <GifTableItem
            key={gif.id}
            gif={gif}
            onDelete={onDelete}
          ></GifTableItem>
        ))}
      </div>

      <div ref={loadMoreRef} data-testid="loadMoreRef" />
    </>
  );
};
