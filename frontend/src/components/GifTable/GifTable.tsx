import { settings } from "../../settings";
import { useEffect, useRef, useState } from "react";
import type { Gif, PageStatus } from "../../types/types";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import "./GifTable.scss";
import { vi } from "vitest";

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === null || current <= 0 ? gifs.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === null || current >= gifs.length - 1 ? 0 : current + 1,
    );
  };

  const selectedGif = selectedIndex === null ? null : gifs[selectedIndex];

  const closeFullscreen = () => {
    setSelectedIndex(null);
  };

  const handleFullscreen = (gif: Gif) => {
    const index = gifs.findIndex((item) => item.id === gif.id);

    if (index !== -1) {
    }
  };

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
            onFullscreem={vi.fn()}
          ></GifTableItem>
        ))}
      </div>

      <div ref={loadMoreRef} data-testid="loadMoreRef" />
    </>
  );
};
