import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ChangePasswordRequest } from "@/lib/models/auth/changePasswordRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/change-password (for brukere med eksisterende passord)
export const POST = (request: Request) =>
  apiRoute("Kunne ikke endre passord.", async (options) => {
    const data: ChangePasswordRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/change-password",
      data,
      options,
    );

    return { message: result?.message || "Passordet ble endret!" };
  });
