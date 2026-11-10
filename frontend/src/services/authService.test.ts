import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./authService";
import { settings } from "../settings";

describe("AuthService", () => {
  const fetchMock = vi.spyOn(globalThis, "fetch");
  let authService!: AuthService;

  beforeEach(() => {
    fetchMock.mockReset();
    authService = new AuthService();
  });

  it("fetchs /auth/session on login", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ authenticated: true })),
    );

    await authService.login("test@email.com", "123456");

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `${settings.apiUrl}/auth/session`,
      {
        body: '{"email":"test@email.com","password":"123456"}',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("throws an exception on fetch error", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(authService.login("test@email.com", "123456")).rejects.toThrow(
      "Invalid email or password",
    );

    expect(fetch).toHaveBeenCalledOnce();
  });

  it("uses the provided base URL to check if session is valid", async () => {
    authService = new AuthService("http://localhost:3000");

    fetchMock.mockResolvedValue(new Response(JSON.stringify({})));

    await authService.checkSession();

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "http://localhost:3000/auth/session",
      { method: "GET", credentials: "include" },
    );
  });

  it.each([401, 403])(
    "should return false if fetch returns %i",
    async (status) => {
      fetchMock.mockResolvedValue(new Response(null, { status }));

      expect(await authService.checkSession()).toBeFalsy();
    },
  );

  it("should throw an exception on fetch error on checkSession", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(authService.checkSession()).rejects.toThrow(`HTTP error: 500`);

    expect(fetch).toHaveBeenCalledOnce();
  });

  it("should execute logout", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({})));

    await authService.logout();

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `${settings.apiUrl}/auth/session`,
      { method: "DELETE", credentials: "include" },
    );
  });

  it("should throw an exception on fetch error on logout", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(authService.logout()).rejects.toThrow(`HTTP error: 500`);

    expect(fetch).toHaveBeenCalledOnce();
  });
});
