import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/auth/resend-confirmation (innlogget bruker)
export const POST = () =>
  apiRoute("Kunne ikke sende bekreftelses-epost på nytt.", async (options) => {
    const result = await agentExternal.post<MessageResponse>(
      "/auth/account/resend-confirmation",
      {},
      options,
    );

    return { message: result?.message || "En ny bekreftelses-epost er sendt." };
  });
