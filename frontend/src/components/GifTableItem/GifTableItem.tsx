import "./GifTableitem.scss";
import { useRef } from "react";
import type { Gif } from "../../types/types";

type GifTableItemProps = {
  gif: Gif;
  onDelete: (gif_id: number) => void;
};

export const GifTableItem = ({ gif, onDelete }: GifTableItemProps) => {
  const mediaRef = useRef<HTMLDivElement>(null);

  const fullScreen = async () => {
    await mediaRef.current?.requestFullscreen();
  };

  const handleDelete = () => {
    onDelete(gif.id);
  };

  const renderVideo = (gif: Gif) => {
    return (
      <video
        src={`data:${gif.content_type};base64,${gif.data}`}
        autoPlay
        loop
        muted
        playsInline
        className="gif"
      ></video>
    );
  };

  const renderGif = (gif: Gif) => {
    return (
      <img
        key={gif.id}
        src={`data:${gif.content_type};base64,${gif.data}`}
        alt={gif.filename}
        className="gif"
      ></img>
    );
  };

  return (
    <div>
      <div ref={mediaRef}>
        {gif.content_type.startsWith("video/")
          ? renderVideo(gif)
          : renderGif(gif)}
      </div>
      <button onClick={fullScreen}>View</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};
