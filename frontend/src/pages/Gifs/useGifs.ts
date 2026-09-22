import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  gifTableReducer,
  initialState,
} from "../../components/GifTable/GifTable.reducer";
import { GifService } from "../../services/GifService";
import type { Gif } from "../../types/types";

const gifService = new GifService();

export const useGifs = () => {
  const [state, dispatch] = useReducer(gifTableReducer, initialState);

  const loadGifs = useCallback(async () => {
    dispatch({ type: "load_started" });
    try {
      const data: Gif[] = await gifService.getAll();
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
      const gif: Gif = await gifService.save(formData);
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
      await gifService.delete(gif_id);

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
