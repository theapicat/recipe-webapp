import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ResetPasswordRequest } from "@/lib/models/auth/resetPasswordRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/reset-password (anonym — via e-postlenke)
export const POST = (request: Request) =>
  apiRoute("Tilbakestilling av passord mislyktes.", async (options) => {
    const data: ResetPasswordRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/reset-password",
      data,
      options,
    );

    return { message: result?.message || "Passordet ble tilbakestilt." };
  });
