import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { DeleteUserAdminRequest } from "@/lib/models/admin/users/DeleteUserAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/delete
export const POST = (request: Request) =>
  apiRoute("Sletting av bruker mislyktes.", async (options) => {
    const data: DeleteUserAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/delete",
      data,
      options,
    );

    return { message: result?.message || "Brukeren har blitt permanent slettet." };
  });
