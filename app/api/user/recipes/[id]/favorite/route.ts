import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { SetRecipeFavoriteRequest } from "@/lib/models/recipes/SetRecipeFavoriteRequest";

interface RecipeContext {
  params: Promise<{ id: string }>;
}

// PUT /api/user/recipes/[id]/favorite — lettvekts av/på-endepunkt for favorittmerking (i stedet for å sende hele
// oppskriften via PUT /user/recipes/[id] kun for å endre ett flagg).
export const PUT = (request: Request, { params }: RecipeContext) =>
  apiRoute<Recipe>("Kunne ikke oppdatere favorittmerkingen.", async (options) => {
    const { id } = await params;
    const data: SetRecipeFavoriteRequest = await request.json();

    const updated = await agentExternal.put<Recipe>(
      `/user/recipes/${encodeURIComponent(id)}/favorite`,
      data,
      options,
    );

    return { message: "Favorittmerkingen ble oppdatert.", body: updated };
  });
