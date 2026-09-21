import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";
import { AdminUpdateUserRequest } from "@/lib/models/admin/users/AdminUpdateUserRequest";
import { MessageResponse } from "@/lib/models/messageResponse";

// GET /api/admin/users
// NB: henter hele brukerlisten flatt — søk/filter/sortering/paginering gjøres client-side i
// app/admin/users/page.tsx. Server-side paginering er bevisst ikke innført ennå — vurder det
// når brukerlisten faktisk blir stor nok til å trenge det.
export const GET = () =>
  apiRoute<AdminUserListItem[]>("Kunne ikke hente brukerliste.", async (options) => {
    const users = await agentExternal.get<AdminUserListItem[]>("/auth/admin/users", options);

    return { message: "Brukerliste hentet med hell.", body: users };
  });

// PUT /api/admin/users
export const PUT = (request: Request) =>
  apiRoute("Oppdatering av bruker mislyktes.", async (options) => {
    const data: AdminUpdateUserRequest = await request.json();

    const result = await agentExternal.put<MessageResponse>("/auth/admin/users", data, options);

    return { message: result?.message || "Brukerinformasjonen ble oppdatert." };
  });
