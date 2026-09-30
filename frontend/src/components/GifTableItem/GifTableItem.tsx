import "./GifTableitem.scss";
import { memo, useEffect, useRef } from "react";
import type { Gif } from "../../types/types";
import { settings } from "../../settings";

type GifTableItemProps = {
  gif: Gif;
  onDelete: (gif_id: number) => void;
};

export const GifTableItem = memo(({ gif, onDelete }: GifTableItemProps) => {
  const gifRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = gif.content_type.startsWith("video/");

  const fullScreen = async () => {
    const ref = isVideo ? videoRef : gifRef;
    await ref.current?.requestFullscreen();
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Confirm delete?");
    if (!confirmed) {
      return;
    }
    onDelete(gif.id);
  };

  const renderVideo = (gif: Gif) => {
    return (
      <video
        src={`${settings.apiUrl}/gifs/${gif.id}`}
        ref={videoRef}
        loop
        muted
        playsInline
        className="gif"
      />
    );
  };

  const renderGif = (gif: Gif) => {
    return (
      <img
        key={gif.id}
        src={`${settings.apiUrl}/gifs/${gif.id}`}
        alt={gif.filename}
        ref={gifRef}
        className="gif"
        loading="lazy"
      />
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="media-container">
      <span className="media-type">{isVideo ? "▶ MP4" : "GIF"}</span>
      {isVideo ? renderVideo(gif) : renderGif(gif)}
      <div className="button-container">
        <button aria-label="Fullscreen" onClick={fullScreen}>
          ⛶
        </button>
        <button aria-label="Delete" onClick={handleDelete}>
          -
        </button>
      </div>
    </div>
  );
});
