import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { RecoverPasswordRequest } from "@/lib/models/auth/recoverPasswordRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/recover (glemt passord)
export const POST = (request: Request) =>
  apiRoute("Kunne ikke sende gjenopprettingslenke.", async (options) => {
    const data: RecoverPasswordRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/recover",
      data,
      options,
    );

    return { message: result?.message || "Gjenopprettingslenke er sendt." };
  });
