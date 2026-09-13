import { cookies } from "next/headers";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export interface OpenIddictTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user_data";

const sessionManager = {
  // --- SETT HELE SESJONEN (Tokens + Profil) ---
  setSession: async (
    tokens: OpenIddictTokenResponse,
    userProfile: UserProfileResponse,
  ): Promise<void> => {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // Access token levetid fra OpenIddict (standard 1 time om ikke oppgitt)
    const accessExpiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);
    // Refresh token levetid (14 dager)
    const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    // 1. Access Token (HttpOnly)
    cookieStore.set(TOKEN_KEY, tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      expires: accessExpiresAt,
      sameSite: "lax",
      path: "/",
    });

    // 2. Refresh Token (HttpOnly)
    if (tokens.refresh_token) {
      cookieStore.set(REFRESH_TOKEN_KEY, tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        expires: refreshExpiresAt,
        sameSite: "lax",
        path: "/",
      });
    }

    // 3. Brukerprofil (Tilgjengelig for frontend UI)
    cookieStore.set(USER_KEY, JSON.stringify(userProfile), {
      httpOnly: false,
      secure: isProd,
      expires: refreshExpiresAt,
      sameSite: "lax",
      path: "/",
    });
  },

  // --- SLETT HELE SESJONEN ---
  removeSession: async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(USER_KEY);
  },

  // --- INDIVIDUELLE SETTERS ---
  setToken: async (accessToken: string, expiresIn: number = 3600): Promise<void> => {
    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    cookieStore.set(TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  },

  setRefreshToken: async (refreshToken: string): Promise<void> => {
    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  },

  setUserData: async (userProfile: UserProfileResponse): Promise<void> => {
    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    cookieStore.set(USER_KEY, JSON.stringify(userProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  },

  // --- GETTERS ---
  getToken: async (): Promise<string | undefined> => {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_KEY)?.value;
  },

  getRefreshToken: async (): Promise<string | undefined> => {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  },

  getUserData: async (): Promise<UserProfileResponse | undefined> => {
    const cookieStore = await cookies();
    const userString = cookieStore.get(USER_KEY)?.value;
    if (!userString) return undefined;
    try {
      return JSON.parse(userString) as UserProfileResponse;
    } catch {
      return undefined;
    }
  },

  // --- JWT DEKODING OG EVALUERING ---
  getRemainingExpTime: (token: string): number => {
    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return -1;

      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = Buffer.from(base64, "base64").toString("utf-8");
      const claims = JSON.parse(decoded);

      return claims.exp ? claims.exp - Date.now() / 1000 : -1;
    } catch {
      return -1;
    }
  },

  getUserRole: (token: string): string | undefined => {
    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return undefined;

      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = Buffer.from(base64, "base64").toString("utf-8");
      const claims = JSON.parse(decoded);

      const roleClaim =
        claims.role ||
        claims.roles ||
        claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (Array.isArray(roleClaim)) {
        return roleClaim[0];
      }

      return roleClaim;
    } catch {
      return undefined;
    }
  },
};

export default sessionManager;
