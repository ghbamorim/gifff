import { useCallback, useEffect, useReducer } from "react";
import {
  gifTableReducer,
  initialState,
} from "../../components/GifTable/GifTable.reducer";
import { GifService } from "../../services/gifservice";
import type { Gif, GifPage } from "../../types/types";
import { PAGE_SIZE } from "./GifPage";

const gifService = new GifService();

export const useGifs = () => {
  const [state, dispatch] = useReducer(gifTableReducer, initialState);

  const loadGifs = useCallback(
    async (
      page: number = 1,
      abortSignal: AbortSignal | undefined = undefined,
    ) => {
      dispatch({ type: page === 1 ? "load_started" : "load_more_started" });

      try {
        const gifPage: GifPage = await gifService.getAll(
          page,
          PAGE_SIZE,
          state.sortOrder,
          abortSignal,
        );
        if (page === 1) {
          dispatch({
            type: "load_succeeded",
            gifs: gifPage.items,
            pages: gifPage.pages,
          });
        } else {
          dispatch({
            type: "load_more_succeeded",
            gifs: gifPage.items,
            page: gifPage.page,
            pages: gifPage.pages,
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        dispatch({
          type: "load_failed",
          error: error instanceof Error ? error.message : "Unknown Error",
        });
      }
    },
    [state.sortOrder],
  );

  const handleLoadMore = () => {
    if (state.isLoadingMore || state.page >= state.pages) {
      return;
    }
    loadGifs(state.page + 1);
  };

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

  const toggleSortOrder = () => {
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
    const controller = new AbortController();
    loadGifs(1, controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadGifs]);

  return { ...state, toggleSortOrder, saveGif, handleDelete, handleLoadMore };
};
