import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { AddBlacklistRequest } from "@/lib/models/admin/users/AddBlacklistRequest";
import { BlacklistedEntry } from "@/lib/models/admin/users/BlacklistedEntry";
import { MessageResponse } from "@/lib/models/messageResponse";

// GET /api/admin/users/blacklist
export const GET = () =>
  apiRoute<BlacklistedEntry[]>("Kunne ikke hente svartelisten.", async (options) => {
    const entries = await agentExternal.get<BlacklistedEntry[]>("/auth/admin/blacklist", options);

    return { message: "Svartelisten ble hentet.", body: entries };
  });

// POST /api/admin/users/blacklist
export const POST = (request: Request) =>
  apiRoute("Kunne ikke legge til i svartelisten.", async (options) => {
    const data: AddBlacklistRequest = await request.json();

    const result = await agentExternal.post<MessageResponse>(
      "/auth/admin/blacklist",
      data,
      options,
    );

    return { message: result?.message || "Oppføringen ble lagt til i svartelisten." };
  });
