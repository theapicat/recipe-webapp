import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { IngredientRequest } from "@/lib/models/ingredients/IngredientRequest";

interface IngredientContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/ingredients/[id] — hele ingrediensen (næringsverdier og porsjoner), alltid ferskt fra databasen
export const GET = (_request: Request, { params }: IngredientContext) =>
  apiRoute<Ingredient>("Kunne ikke hente ingrediensen.", async (options) => {
    const { id } = await params;

    const ingredient = await agentExternal.get<Ingredient>(
      `/admin/ingredients/${encodeURIComponent(id)}`,
      options,
    );

    return { message: "Ingrediensen ble hentet.", body: ingredient };
  });

// PUT /api/admin/ingredients/[id] — erstatter HELE ingrediensen (alle barn får nye id-er), så send alltid hele settet.
// Svarer med den lagrede ingrediensen.
export const PUT = (request: Request, { params }: IngredientContext) =>
  apiRoute<Ingredient>("Kunne ikke lagre ingrediensen.", async (options) => {
    const { id } = await params;
    const data: IngredientRequest = await request.json();

    const updated = await agentExternal.put<Ingredient>(
      `/admin/ingredients/${encodeURIComponent(id)}`,
      data,
      options,
    );

    return { message: "Ingrediensen ble lagret.", body: updated };
  });

// DELETE /api/admin/ingredients/[id] — 204 fra backend, eller 409 når ingrediensen er i bruk (av en oppskrift,
// en variant eller en ubekreftet ingrediens)
export const DELETE = (_request: Request, { params }: IngredientContext) =>
  apiRoute("Kunne ikke slette ingrediensen.", async (options) => {
    const { id } = await params;

    await agentExternal.delete(`/admin/ingredients/${encodeURIComponent(id)}`, undefined, options);

    return { message: "Ingrediensen ble slettet." };
  });
