import { useCallback, useEffect, useState } from "react";
import { GifTable } from "../../components/GifTable";
import { AddGif } from "../../components/AddGif";
import { settings } from "../../settings";

export type Gif = {
  id: number;
  filename: string;
  content_type: string;
  created_at: string;
  data: string;
};

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
    <>
      <AddGif onSaved={loadGifs}></AddGif>
      <GifTable gifs={gifs}></GifTable>
    </>
  );
};
