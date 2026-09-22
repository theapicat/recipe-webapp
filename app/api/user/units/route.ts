import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Unit } from "@/lib/models/units/Unit";

// GET /api/user/units — skrivebeskyttet lesing av enhetene for vanlige brukere (samme katalog som
// /api/admin/units, men uten admin-krav) — til enhetsvelgeren på hver ingredienslinje i oppskriftsskjemaet.
export const GET = () =>
  apiRoute<Unit[]>("Kunne ikke hente enheter.", async (options) => {
    const units = await agentExternal.get<Unit[]>("/user/units", options);

    return { message: "Enheter hentet.", body: units };
  });
