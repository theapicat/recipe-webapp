import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager from "@/lib/session/sessionManager";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { UpdateProfileRequest } from "@/lib/models/auth/updateProfileRequest";

// PUT /api/auth/updateProfile
export const PUT = (request: Request) =>
  apiRoute<UserProfileResponse>("Kunne ikke oppdatere profilen.", async (options) => {
    const data: UpdateProfileRequest = await request.json();

    // 1. Send oppdatering til Auth API
    const updatedProfile = await agentExternal.put<UserProfileResponse>(
      "/auth/account/profile",
      data,
      options,
    );

    // 2. Oppdater brukerdata i cookies
    await sessionManager.setUserData(updatedProfile);

    return { message: "Profilen ble oppdatert!", body: updatedProfile };
  });
