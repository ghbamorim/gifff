import { PAGE_SIZE } from "../pages/Gifs/GifPage";
import { settings } from "../settings";
import type { Gif, GifPage, SortOrder } from "../types/types";

export class GifService {
  private readonly baseUrl: string;
  constructor(baseUrl: string = settings.apiUrl) {
    this.baseUrl = baseUrl;
  }

  async getAll(
    page: number,
    page_size = PAGE_SIZE,
    sort_order: SortOrder = "asc",
    abortSignal: AbortSignal | undefined = undefined,
  ): Promise<GifPage> {
    const response = await fetch(
      `${this.baseUrl}/gifs?` +
        `page=${page}` +
        `&page_size=${page_size}` +
        `&sort_order=${sort_order}`,
      { signal: abortSignal },
    );
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

  async save(formData: FormData): Promise<Gif> {
    const response = await fetch(`${this.baseUrl}/gifs`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

  async delete(gifId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/gifs/${gifId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  }
}
