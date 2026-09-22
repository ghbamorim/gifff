import "./GifTable.scss";
import { GifTableItem } from "../GifTableItem/GifTableItem";
import type { Gif } from "../../types/gif.types";

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
