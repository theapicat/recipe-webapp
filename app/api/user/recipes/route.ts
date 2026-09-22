import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { RecipeListItem } from "@/lib/models/recipes/RecipeListItem";
import { RecipeRequest } from "@/lib/models/recipes/RecipeRequest";

// GET /api/user/recipes — hele oppskriftslisten (lett variant). Søk og filtrering gjøres i klienten.
export const GET = () =>
  apiRoute<RecipeListItem[]>("Kunne ikke hente oppskrifter.", async (options) => {
    const recipes = await agentExternal.get<RecipeListItem[]>("/user/recipes", options);

    return { message: "Oppskrifter hentet.", body: recipes };
  });

// POST /api/user/recipes — body uten id-er (serveren tildeler dem og setter source.type til "Manual");
// svarer 201 med hele oppskriften.
export const POST = (request: Request) =>
  apiRoute<Recipe>("Kunne ikke opprette oppskriften.", async (options) => {
    const data: RecipeRequest = await request.json();

    const created = await agentExternal.post<Recipe>("/user/recipes", data, options);

    return { message: "Oppskriften ble opprettet.", body: created, status: 201 };
  });
