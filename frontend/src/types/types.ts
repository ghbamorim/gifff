export type SortOrder = "asc" | "desc";

export type Gif = {
  id: number;
  filename: string;
  content_type: string;
  created_at: string;
};

export type GifPage = {
  items: Gif[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
};

export type PageStatus = "idle" | "loading" | "saving" | "deleting" | "error";
