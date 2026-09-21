import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { IngredientRequest } from "@/lib/models/ingredients/IngredientRequest";

// Egen statisk rute (ikke [resource]): ingredienser avviker fra katalogkontrakten (barnelister, PUT med id i stien).

// GET /api/admin/ingredients — hele ingredienslisten (lett variant, ~1 565 rader). Filtrering og søk gjøres i
// klienten; backend-filtrene (name, categoryId, allergenId, ...) brukes ikke.
export const GET = () =>
  apiRoute<IngredientListItem[]>("Kunne ikke hente ingredienser.", async (options) => {
    const ingredients = await agentExternal.get<IngredientListItem[]>(
      "/admin/ingredients",
      options,
    );

    return { message: "Ingredienser hentet.", body: ingredients };
  });

// POST /api/admin/ingredients — body uten id-er (serveren tildeler dem); svarer 201 med hele ingrediensen
export const POST = (request: Request) =>
  apiRoute<Ingredient>("Kunne ikke opprette ingrediensen.", async (options) => {
    const data: IngredientRequest = await request.json();

    const created = await agentExternal.post<Ingredient>("/admin/ingredients", data, options);

    return { message: "Ingrediensen ble opprettet.", body: created, status: 201 };
  });
