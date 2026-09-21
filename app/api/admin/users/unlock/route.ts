import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { UnlockUserRequest } from "@/lib/models/admin/users/UnlockUserRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// POST /api/admin/users/unlock
export const POST = (request: Request) =>
  apiRoute("Kunne ikke gjenåpne brukeren.", async (options) => {
    const data: UnlockUserRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/users/unlock",
      data,
      options,
    );

    return { message: result?.message || "Sperren har blitt fjernet." };
  });
