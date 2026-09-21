import { agentExternal } from "@/lib/agent/agentExternal";
import { ApiError } from "@/lib/agent/ApiError";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";

// POST /api/auth/refresh
// Brukes av agentInternal til å fornye access-tokenet når et kall feiler med 401 — se
// documentation/03-auth-and-session.md for hele flyten. Kalles ALDRI direkte fra en komponent.
export const POST = () =>
  apiRoute("Sesjonen er utløpt.", async () => {
    try {
      const refreshToken = await sessionManager.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError("Ingen refresh token tilgjengelig.", 401);
      }

      // OAuth2 Refresh Token Grant
      const tokens = await agentExternal.postForm<OpenIddictTokenResponse>(
        "/auth/connect/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: "recipe-web-app",
        }),
        { errorMessage: "Kunne ikke fornye token." },
      );

      await sessionManager.setToken(tokens.access_token, tokens.expires_in);
      if (tokens.refresh_token) {
        await sessionManager.setRefreshToken(tokens.refresh_token);
      }
    } catch (error: unknown) {
      // Refresh-tokenet er selv utløpt/ugyldig — ingen vits i å beholde resten av sesjonen
      await sessionManager.removeSession();
      throw new ApiError(error instanceof Error ? error.message : "Sesjonen er utløpt.", 401);
    }

    return { message: "Token fornyet." };
  });
