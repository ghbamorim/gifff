import { url, type Gif } from "../pages/Gifs/GifPage";

type GifTableProps = {
  gifs: Gif[];
};

export const GifTable = ({ gifs }: GifTableProps) => {
  return (
    <>
      {gifs.map((gif) => (
        <img key={gif.id} src={`${url}${gif.id}`} alt={gif.filename}></img>
      ))}
    </>
  );
};
