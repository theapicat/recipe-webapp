import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { RecipeNutrition } from "@/lib/models/recipes/RecipeNutrition";

interface RecipeContext {
  params: Promise<{ id: string }>;
}

// GET /api/user/recipes/[id]/nutrition — beregnes på forespørsel fra dagens ingrediensdata (lagres aldri),
// for oppskriftens EGNE porsjoner (`recipe.servings`) — tar ingen egen porsjons-parameter. Per-porsjon-visning
// er derfor en klientside-deling (se components/recipes/RecipeNutritionView.tsx), ikke et eget kall. Bekreftet
// mot recipe-core-api sin kildekode 2026-09-23 (UserRecipeController.GetNutrition).
export const GET = (_request: Request, { params }: RecipeContext) =>
  apiRoute<RecipeNutrition>("Kunne ikke beregne næringsinnhold.", async (options) => {
    const { id } = await params;

    const nutrition = await agentExternal.get<RecipeNutrition>(
      `/user/recipes/${encodeURIComponent(id)}/nutrition`,
      options,
    );

    return { message: "Næringsinnholdet ble beregnet.", body: nutrition };
  });
