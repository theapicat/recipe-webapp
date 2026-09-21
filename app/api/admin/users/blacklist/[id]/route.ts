import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { MessageResponse } from "@/lib/models/messageResponse";

// DELETE /api/admin/users/blacklist/[id]
export const DELETE = (_request: Request, { params }: { params: Promise<{ id: string }> }) =>
  apiRoute("Kunne ikke fjerne fra svartelisten.", async (options) => {
    const { id } = await params;

    const result = await agentExternal.delete<MessageResponse>(
      `/auth/admin/blacklist/${id}`,
      undefined,
      options,
    );

    return { message: result?.message || "Oppføringen ble fjernet fra svartelisten." };
  });
