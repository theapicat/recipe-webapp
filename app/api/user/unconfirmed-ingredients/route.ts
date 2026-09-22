import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { CreateUnconfirmedIngredientRequest } from "@/lib/models/ingredients/CreateUnconfirmedIngredientRequest";
import { UnconfirmedIngredient } from "@/lib/models/ingredients/UnconfirmedIngredient";

// POST /api/user/unconfirmed-ingredients — brukerens egen ingrediens som ikke finnes i den offisielle katalogen
// ennå (se UnconfirmedIngredient.ts). Brukt fra oppskriftsskjemaets ingrediensvelger når det som skrives inn
// ikke matcher noe i katalogen. Svarer 201 med den opprettede raden.
//
// Gateway-stien er ANTATT, ikke bekreftet mot backend — se backend-notes.md, B17.
export const POST = (request: Request) =>
  apiRoute<UnconfirmedIngredient>("Kunne ikke legge til ingrediensen.", async (options) => {
    const data: CreateUnconfirmedIngredientRequest = await request.json();

    const created = await agentExternal.post<UnconfirmedIngredient>(
      "/user/unconfirmed-ingredients",
      data,
      options,
    );

    return { message: "Ingrediensen ble lagt til.", body: created, status: 201 };
  });
