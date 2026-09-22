import { useCallback, useEffect, useReducer } from "react";
import {
  gifTableReducer,
  initialState,
} from "../../components/GifTable/GifTable.reducer";
import { settings } from "../../settings";
import type { Gif } from "../../types/gif.types";

export const useGifs = () => {
  const [state, dispatch] = useReducer(gifTableReducer, initialState);

  const loadGifs = useCallback(async () => {
    dispatch({ type: "load_started" });
    try {
      const response = await fetch(`${settings.apiUrl}/gifs`);
      const data: Gif[] = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      dispatch({ type: "load_succeeded", gifs: data });
    } catch (error) {
      dispatch({
        type: "load_failed",
        error: error instanceof Error ? error.message : "Unknown Error",
      });
    }
  }, []);

  const saveGif = async (formData: FormData) => {
    dispatch({ type: "saving_started" });
    try {
      const response = await fetch(`${settings.apiUrl}/gifs`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const gif: Gif = await response.json();

      dispatch({ type: "saving_succeeded", gif: gif });
    } catch (error) {
      dispatch({
        type: "saving_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    loadGifs();
  }, [loadGifs]);

  return { ...state, saveGif };
};
