import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { SetPasswordRequest } from "@/lib/models/auth/setPasswordRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/set-password (for Google-brukere uten lokalt passord)
export const POST = (request: Request) =>
  apiRoute("Kunne ikke opprette passord.", async (options) => {
    const data: SetPasswordRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/set-password",
      data,
      options,
    );

    return { message: result?.message || "Passordet ble opprettet!" };
  });
