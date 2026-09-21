import { agentExternal } from "@/lib/agent/agentExternal";
import { ApiError } from "@/lib/agent/ApiError";
import { apiRoute } from "@/lib/http/apiRoute";
import { ConfirmEmailRequest } from "@/lib/models/auth/confirmEmailRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/confirm-email (anonym — via e-postlenke)
export const POST = (request: Request) =>
  apiRoute("Kunne ikke bekrefte e-post.", async (options) => {
    const data: ConfirmEmailRequest = await request.json();

    if (!data.userId || !data.token) {
      throw new ApiError("Mangler userId eller token.", 400);
    }

    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/confirm-email",
      data,
      options,
    );

    return { message: result?.message || "E-postadressen er bekreftet." };
  });
