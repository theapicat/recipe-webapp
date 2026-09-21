import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";

// GET /api/admin/users/[id]
export const GET = (_request: Request, { params }: { params: Promise<{ id: string }> }) =>
  apiRoute<AdminUserDetails>("Kunne ikke hente brukerdetaljer.", async (options) => {
    const { id } = await params;

    const userDetails = await agentExternal.get<AdminUserDetails>(
      `/auth/admin/users/${id}`,
      options,
    );

    return { message: "Brukerdetaljer hentet med hell.", body: userDetails };
  });
