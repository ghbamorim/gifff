import "./GifPage.scss";
import { useCallback, useEffect, useState } from "react";
import { GifTable } from "../../components/GifTable/GifTable";
import { AddGif } from "../../components/AddGif";
import { settings } from "../../settings";
import type { Gif } from "../../types/gif.types";

export const GifPage = () => {
  const [gifs, setGifs] = useState<Gif[]>([]);

  const loadGifs = useCallback(async () => {
    const response = await fetch(`${settings.apiUrl}/gifs`);
    const data: Gif[] = await response.json();
    setGifs(data);
  }, []);

  useEffect(() => {
    loadGifs();
  }, [loadGifs]);

  return (
    <div className="gif-page">
      <div>
        <AddGif onSaved={loadGifs}></AddGif>
      </div>
      <div>
        <GifTable gifs={gifs}></GifTable>
      </div>
    </div>
  );
};
