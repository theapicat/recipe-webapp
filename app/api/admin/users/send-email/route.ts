import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { SendUserEmailAdminRequest } from "@/lib/models/admin/users/SendUserEmailAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/send-email
export const POST = (request: Request) =>
  apiRoute("Kunne ikke sende e-posten. Vennligst prøv igjen senere.", async (options) => {
    const data: SendUserEmailAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/send-email",
      data,
      options,
    );

    return { message: result?.message || "E-posten ble sendt til brukeren." };
  });
