import type { Gif } from "../../types/gif.types";

export type GifTableState = {
  gifs: Gif[];
  status: "idle" | "loading" | "saving" | "deleting" | "error";
  error: string | null;
};

export type GifTableAction =
  | { type: "load_started" }
  | { type: "load_succeeded"; gifs: Gif[] }
  | { type: "load_failed"; error: string }
  | { type: "saving_started" }
  | { type: "saving_succeeded"; gif: Gif }
  | { type: "saving_failed"; error: string };
