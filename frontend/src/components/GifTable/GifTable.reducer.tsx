import type { GifTableAction, GifTableState } from "./GifTable.types";

export const initialState: GifTableState = {
  gifs: [],
  status: "idle",
  isLoadingMore: false,
  error: null,
  sortOrder: "desc",
  page: 0,
  pages: 0,
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
        isLoadingMore: true,
      };

    case "load_succeeded":
      return {
        ...state,
        gifs: [...state.gifs, ...action.gifs],
        status: "idle",
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
        gifs: [action.gif, ...state.gifs],
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
        gifs: state.gifs.filter((gif) => gif.id !== action.gif_id),
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
        ...initialState,
        sortOrder: action.sortOrder,
      };

    default:
      return state;
  }
};
