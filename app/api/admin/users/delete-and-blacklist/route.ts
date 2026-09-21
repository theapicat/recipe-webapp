import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { DeleteAndBlacklistUserAdminRequest } from "@/lib/models/admin/users/DeleteAndBlacklistUserAdminRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/delete-and-blacklist
export const POST = (request: Request) =>
  apiRoute("Sletting og svartelisting mislyktes.", async (options) => {
    const data: DeleteAndBlacklistUserAdminRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/delete-and-blacklist",
      data,
      options,
    );

    return {
      message: result?.message || "Brukeren har blitt slettet og e-posten er svartelistet.",
    };
  });
