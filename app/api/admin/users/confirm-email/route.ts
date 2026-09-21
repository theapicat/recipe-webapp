import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ResendConfirmationAdminRequest } from "@/lib/models/admin/users/ResendConfirmationAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/confirm-email
export const POST = (request: Request) =>
  apiRoute("Manuell bekreftelse av e-post mislyktes.", async (options) => {
    const data: ResendConfirmationAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/confirm-email",
      data,
      options,
    );

    return { message: result?.message || "E-postadressen ble manuelt bekreftet." };
  });
