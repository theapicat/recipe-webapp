import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager from "@/lib/session/sessionManager";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

// GET /api/auth/complete-welcome
export const GET = () =>
  apiRoute<UserProfileResponse>("Kunne ikke fullføre velkomstreisen.", async (options) => {
    const updatedUser = await agentExternal.get<UserProfileResponse>(
      "/auth/account/complete-welcome",
      options,
    );

    // Oppdaterer cookien på server-siden slik at framtidige requests har fersk profil
    await sessionManager.setUserData(updatedUser);

    return { message: "Velkomstreisen er fullført.", body: updatedUser };
  });
