import { useCallback, useReducer, useRef } from "react";
import {
  gifTableReducer,
  initialState,
} from "../../components/GifTable/GifTable.reducer";
import { GifService } from "../../services/gifservice";
import type { Gif, GifPage } from "../../types/types";
import { PAGE_SIZE } from "../../services/gifservice";

const gifService = new GifService();

export const useGifs = () => {
  const [state, dispatch] = useReducer(gifTableReducer, initialState);
  const isLoadingMoreRef = useRef(false);

  const loadGifs = useCallback(
    async (page: number) => {
      dispatch({ type: "load_started" });

      try {
        const gifPage: GifPage = await gifService.getAll(
          page,
          PAGE_SIZE,
          state.sortOrder,
        );

        dispatch({
          type: "load_succeeded",
          gifs: gifPage.items,
          page: gifPage.page,
          pages: gifPage.pages,
        });
      } catch (error) {
        dispatch({
          type: "load_failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [state.sortOrder],
  );

  const handleLoadMore = useCallback(async () => {
    if (
      isLoadingMoreRef.current ||
      (state.pages > 0 && state.page >= state.pages)
    ) {
      return;
    }
    isLoadingMoreRef.current = true;
    try {
      await loadGifs(state.page + 1);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [loadGifs, state.page, state.pages]);

  const saveGif = useCallback(async (formData: FormData) => {
    dispatch({ type: "saving_started" });
    try {
      const gifs: Gif[] = await gifService.save(formData);
      dispatch({ type: "saving_succeeded", gifs });
    } catch (error) {
      dispatch({
        type: "saving_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  const toggleSortOrder = useCallback(() => {
    const newSortOrder = state.sortOrder === "asc" ? "desc" : "asc";
    dispatch({ type: "sort_order_change", sortOrder: newSortOrder });
  }, [state.sortOrder]);

  const handleDelete = useCallback(async (gif_id: number) => {
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
  }, []);

  return { ...state, toggleSortOrder, saveGif, handleDelete, handleLoadMore };
};
