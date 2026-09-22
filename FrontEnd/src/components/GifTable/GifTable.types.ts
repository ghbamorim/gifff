import type { Gif, SortOrder } from "../../types/types";

export type GifTableState = {
  gifs: Gif[];
  status: "idle" | "loading" | "saving" | "deleting" | "error";
  error: string | null;
  sortOrder: SortOrder;
};

export type GifTableAction =
  | { type: "load_started" }
  | { type: "load_succeeded"; gifs: Gif[] }
  | { type: "load_failed"; error: string }
  | { type: "saving_started" }
  | { type: "saving_succeeded"; gif: Gif }
  | { type: "saving_failed"; error: string }
  | { type: "sort_order_change"; sortOrder: SortOrder };
