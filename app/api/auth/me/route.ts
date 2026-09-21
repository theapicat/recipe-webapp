import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager from "@/lib/session/sessionManager";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

// GET /api/auth/me
export const GET = () =>
  apiRoute<UserProfileResponse>("Kunne ikke hente brukerprofil.", async (options) => {
    const profile = await agentExternal.get<UserProfileResponse>("/auth/account/me", options);

    // Synkroniserer cookien slik at initialUser i Server Components er oppdatert
    await sessionManager.setUserData(profile);

    return { message: "Brukerprofil hentet.", body: profile };
  });
