import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ResetPasswordAdminRequest } from "@/lib/models/admin/users/ResetPasswordAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/reset-password-request
export const POST = (request: Request) =>
  apiRoute("Kunne ikke sende tilbakestillingslenke.", async (options) => {
    const data: ResetPasswordAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/reset-password-request",
      data,
      options,
    );

    return { message: result?.message || "Lenke for tilbakestilling av passord har blitt sendt." };
  });
