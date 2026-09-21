import "./GifTable.scss";
import { type Gif } from "../pages/Gifs/GifPage";
import { GifTableItem } from "./GifTableItem/GifTableItem";

type GifTableProps = {
  gifs: Gif[];
};

export const GifTable = ({ gifs }: GifTableProps) => {
  return (
    <>
      {gifs.map((gif) => (
        <GifTableItem key={gif.id} gif={gif}></GifTableItem>
      ))}
    </>
  );
};
