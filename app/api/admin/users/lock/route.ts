import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { LockUserRequest } from "@/lib/models/admin/users/LockUserRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/lock
export const POST = (request: Request) =>
  apiRoute("Kunne ikke sperre brukeren.", async (options) => {
    const data: LockUserRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/lock",
      data,
      options,
    );

    return { message: result?.message || "Brukeren har blitt sperret." };
  });
