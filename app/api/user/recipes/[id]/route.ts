import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { RecipeRequest } from "@/lib/models/recipes/RecipeRequest";

interface RecipeContext {
  params: Promise<{ id: string }>;
}

// GET /api/user/recipes/[id] — hele oppskriften (ingredienser og steg), alltid ferskt fra databasen.
export const GET = (_request: Request, { params }: RecipeContext) =>
  apiRoute<Recipe>("Kunne ikke hente oppskriften.", async (options) => {
    const { id } = await params;

    const recipe = await agentExternal.get<Recipe>(
      `/user/recipes/${encodeURIComponent(id)}`,
      options,
    );

    return { message: "Oppskriften ble hentet.", body: recipe };
  });

// PUT /api/user/recipes/[id] — erstatter HELE oppskriften (steg og ingredienslinjer får nye id-er), så send
// alltid hele settet. Svarer med den lagrede oppskriften.
export const PUT = (request: Request, { params }: RecipeContext) =>
  apiRoute<Recipe>("Kunne ikke lagre oppskriften.", async (options) => {
    const { id } = await params;
    const data: RecipeRequest = await request.json();

    const updated = await agentExternal.put<Recipe>(
      `/user/recipes/${encodeURIComponent(id)}`,
      data,
      options,
    );

    return { message: "Oppskriften ble lagret.", body: updated };
  });

// DELETE /api/user/recipes/[id] — 204 fra backend.
export const DELETE = (_request: Request, { params }: RecipeContext) =>
  apiRoute("Kunne ikke slette oppskriften.", async (options) => {
    const { id } = await params;

    await agentExternal.delete(`/user/recipes/${encodeURIComponent(id)}`, undefined, options);

    return { message: "Oppskriften ble slettet." };
  });
