import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { resolveCatalogResource } from "@/lib/http/resolveCatalogResource";

// DELETE /api/admin/[resource]/[id] — se app/api/admin/[resource]/route.ts for hvitlisten. Backend svarer 204 (også når
// ingenting ble slettet) og 409 når raden er i bruk; meldingen fra 409 sendes videre til brukeren.
export const DELETE = (
  _request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) =>
  apiRoute("Kunne ikke slette oppføringen.", async (options) => {
    const resource = await resolveCatalogResource(params, { write: true });
    const { id } = await params;

    await agentExternal.delete(`/admin/${resource}/${encodeURIComponent(id)}`, undefined, options);

    return { message: "Oppføringen ble slettet." };
  });
