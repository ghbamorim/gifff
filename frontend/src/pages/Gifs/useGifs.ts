import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  gifTableReducer,
  initialState,
} from "../../components/GifTable/GifTable.reducer";
import { settings } from "../../settings";
import type { Gif } from "../../types/types";

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

  const sortedGifs = useMemo(() => {
    return [...state.gifs].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();

      return state.sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [state.gifs, state.sortOrder]);

  const togleSortOrder = () => {
    const newSortOrder = state.sortOrder === "asc" ? "desc" : "asc";
    dispatch({ type: "sort_order_change", sortOrder: newSortOrder });
  };

  const handleDelete = async (gif_id: number) => {
    dispatch({ type: "deleting_started" });
    try {
      const response = await fetch(`${settings.apiUrl}/gifs/${gif_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      dispatch({ type: "deleting_succeeded", gif_id: gif_id });
    } catch (error) {
      dispatch({
        type: "deleting_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    loadGifs();
  }, [loadGifs]);

  return { ...state, gifs: sortedGifs, togleSortOrder, saveGif, handleDelete };
};
