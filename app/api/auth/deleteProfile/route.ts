import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager from "@/lib/session/sessionManager";

// DELETE /api/auth/deleteProfile
export const DELETE = () =>
  apiRoute("Kunne ikke slette kontoen.", async (options) => {
    // 1. Slett i backend
    await agentExternal.delete("/auth/account/me", undefined, options);

    // 2. Fjerner cookies/sesjon
    await sessionManager.removeSession();

    return { message: "Kontoen din er nå slettet." };
  });
