import { type Gif } from "../pages/Gifs/GifPage";

type GifTableProps = {
  gifs: Gif[];
};

export const GifTable = ({ gifs }: GifTableProps) => {
  return (
    <>
      {gifs.map((gif) => {
        const src = `data:${gif.content_type};base64,${gif.data}`;
        return gif.content_type === "video/mp4" ? (
          <video key={gif.id} src={src} autoPlay loop muted></video>
        ) : (
          <img key={gif.id} src={src} alt={gif.filename}></img>
        );
      })}
    </>
  );
};
