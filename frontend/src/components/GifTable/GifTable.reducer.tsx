import type { GifTableAction, GifTableState } from "./GifTable.types";

export const initialState: GifTableState = {
  gifs: [],
  status: "idle",
  isLoadingMore: false,
  error: null,
  sortOrder: "desc",
  page: 1,
  pages: 1,
};

export const gifTableReducer = (
  state: GifTableState,
  action: GifTableAction,
): GifTableState => {
  switch (action.type) {
    case "load_started":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "load_more_started":
      return {
        ...state,
        error: null,
        isLoadingMore: true,
      };

    case "load_succeeded":
      return {
        ...state,
        gifs: action.gifs,
        status: "idle",
        page: 1,
        pages: action.pages,
      };

    case "load_more_succeeded":
      return {
        ...state,
        gifs: [...state.gifs, ...action.gifs],
        page: action.page,
        pages: action.pages,
        isLoadingMore: false,
      };

    case "load_failed":
      return {
        ...state,
        status: "error",
        error: action.error,
        isLoadingMore: false,
      };

    case "saving_started":
      return {
        ...state,
        status: "saving",
        error: null,
      };

    case "saving_succeeded":
      return {
        ...state,
        status: "idle",
        gifs: [...state.gifs, action.gif],
        error: null,
      };

    case "saving_failed":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "deleting_started":
      return {
        ...state,
        status: "deleting",
        error: null,
      };

    case "deleting_succeeded":
      return {
        ...state,
        status: "idle",
        gifs: [...state.gifs].filter((gif) => gif.id !== action.gif_id),
        error: null,
      };

    case "deleting_failed":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "sort_order_change":
      return {
        ...state,
        sortOrder: action.sortOrder,
        page: 1,
      };

    default:
      return state;
  }
};
