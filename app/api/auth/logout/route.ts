import { agentExternal } from "@/lib/agent/agentExternal";
import { ApiError } from "@/lib/agent/ApiError";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager from "@/lib/session/sessionManager";

const ERROR_MESSAGE = "Det oppstod en feil under utlogging.";

export const POST = () =>
  apiRoute(ERROR_MESSAGE, async () => {
    try {
      // OAuth2 Revocation (RFC 7009). Best-effort: utlogging skal aldri feile for brukeren selv om dette
      // kallet feiler (f.eks. fordi Gatewayen ikke har implementert /connect/revoke ennå). Må skje FØR
      // removeSession() siden refreshToken-cookien leses her.
      const refreshToken = await sessionManager.getRefreshToken();

      if (refreshToken) {
        try {
          await agentExternal.postForm(
            "/auth/connect/revoke",
            new URLSearchParams({
              token: refreshToken,
              token_type_hint: "refresh_token",
              client_id: "recipe-web-app",
            }),
          );
        } catch {
          // Ignorert med vilje — se kommentar over.
        }
      }

      await sessionManager.removeSession();
    } catch {
      throw new ApiError(ERROR_MESSAGE, 500);
    }

    return { message: "Utlogging vellykket!" };
  });
