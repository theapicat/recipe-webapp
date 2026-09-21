import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { resolveCatalogResource } from "@/lib/http/resolveCatalogResource";
import { CatalogItem } from "@/lib/models/catalog/CatalogModelMap";

// Dynamisk rute for alle adminstyrte kataloger (recipe-categories, ingredient-categories, allergens,
// search-keywords, unit-types, units) — de deler samme kontrakt mot Core: GET/POST/PUT på /admin/<resource>.
// Gyldige navn er hvitlisten i lib/models/catalog/CatalogResource.ts; alt annet gir 404. Statiske ruter
// (f.eks. app/api/admin/users) har forrang over dette segmentet.
interface CatalogContext {
  params: Promise<{ resource: string }>;
}

// GET /api/admin/[resource] — hele katalogen, sortert på navn av backend
export const GET = (_request: Request, { params }: CatalogContext) =>
  apiRoute<CatalogItem[]>("Kunne ikke hente katalogen.", async (options) => {
    const resource = await resolveCatalogResource(params);

    const items = await agentExternal.get<CatalogItem[]>(`/admin/${resource}`, options);

    return { message: "Katalogen ble hentet.", body: items };
  });

// POST /api/admin/[resource] — body uten id (serveren tildeler den); svarer 201 med den opprettede raden
export const POST = (request: Request, { params }: CatalogContext) =>
  apiRoute<CatalogItem>("Kunne ikke opprette oppføringen.", async (options) => {
    const resource = await resolveCatalogResource(params, { write: true });
    const data: Omit<CatalogItem, "id"> = await request.json();

    const created = await agentExternal.post<CatalogItem>(`/admin/${resource}`, data, options);

    return { message: "Oppføringen ble opprettet.", body: created, status: 201 };
  });

// PUT /api/admin/[resource] — hele raden med id i body (ingen id i stien). Backend svarer 200 uten body, og også
// 200 dersom raden ikke finnes — les listen på nytt etterpå.
export const PUT = (request: Request, { params }: CatalogContext) =>
  apiRoute("Kunne ikke lagre endringen.", async (options) => {
    const resource = await resolveCatalogResource(params, { write: true });
    const data: CatalogItem = await request.json();

    await agentExternal.put(`/admin/${resource}`, data, options);

    return { message: "Endringen ble lagret." };
  });
