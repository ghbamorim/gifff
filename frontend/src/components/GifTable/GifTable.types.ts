import type { Gif, PageStatus, SortOrder } from "../../types/types";

export type GifTableState = {
  gifs: Gif[];
  status: PageStatus;
  isLoadingMore: boolean;
  error: string | null;
  sortOrder: SortOrder;
  page: number;
  pages: number;
};

export type GifTableAction =
  | { type: "load_started" }
  | { type: "load_succeeded"; gifs: Gif[]; page: number; pages: number }
  | { type: "load_failed"; error: string }
  | { type: "saving_started" }
  | { type: "saving_succeeded"; gif: Gif }
  | { type: "saving_failed"; error: string }
  | { type: "deleting_started" }
  | { type: "deleting_succeeded"; gif_id: number }
  | { type: "deleting_failed"; error: string }
  | { type: "sort_order_change"; sortOrder: SortOrder };
