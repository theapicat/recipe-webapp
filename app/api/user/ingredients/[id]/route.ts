import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";

interface IngredientContext {
  params: Promise<{ id: string }>;
}

// GET /api/user/ingredients/[id] — hele ingrediensen (inkl. `portions`), alltid ferskt. Brukt av oppskriftsskjemaet
// til å slå opp hvilke enheter som faktisk har en definert gram-omregning for den valgte ingrediensen (se
// components/recipes/recipeLookups.ts, unitsForIngredient()) — den lette listen (/api/user/ingredients) har ikke
// `portions`. Bekreftet mot recipe-core-api sin kildekode 2026-09-23 (API/Controllers/UserControllers/Ingredients/
// UserIngredientController.cs): `GET /api/user/ingredients/{id:guid}`, ingen adminkrav, samme `Ingredient`-form
// som admin-ruten.
export const GET = (_request: Request, { params }: IngredientContext) =>
  apiRoute<Ingredient>("Kunne ikke hente ingrediensen.", async (options) => {
    const { id } = await params;

    const ingredient = await agentExternal.get<Ingredient>(
      `/user/ingredients/${encodeURIComponent(id)}`,
      options,
    );

    return { message: "Ingrediensen ble hentet.", body: ingredient };
  });
