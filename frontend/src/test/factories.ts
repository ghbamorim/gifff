import type { Gif } from "../types/types";

export const createGif = (overrides: Partial<Gif> = {}): Gif => ({
  id: 1,
  filename: "cat.gif",
  content_type: "image/gif",
  created_at: "2026-01-01",
  ...overrides,
});

export const createVideo = (overrides: Partial<Gif> = {}): Gif => ({
  id: 1,
  filename: "cat.mp4",
  content_type: "video/mp4",
  created_at: "2026-01-01",
  ...overrides,
});
