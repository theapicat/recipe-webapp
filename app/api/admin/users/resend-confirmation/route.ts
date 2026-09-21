import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ResendConfirmationAdminRequest } from "@/lib/models/admin/users/ResendConfirmationAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/resend-confirmation
export const POST = (request: Request) =>
  apiRoute("Kunne ikke sende bekreftelsese-post på nytt.", async (options) => {
    const data: ResendConfirmationAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/resend-confirmation",
      data,
      options,
    );

    return { message: result?.message || "Ny bekreftelseslenke har blitt sendt." };
  });
