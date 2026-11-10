import { settings } from "../settings";

export class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = settings.apiUrl) {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/session`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }
  }

  async checkSession(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/session`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return true;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/session`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  }
}
