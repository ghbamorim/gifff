import { settings } from "../settings";
import type { Gif } from "../types/types";

export class GifService {
  private readonly baseUrl: string;
  constructor(baseUrl: string = settings.apiUrl) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Gif[]> {
    const response = await fetch(`${this.baseUrl}/gifs`);
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
