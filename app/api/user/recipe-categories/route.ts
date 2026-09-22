import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { RecipeCategory } from "@/lib/models/recipes/RecipeCategory";

// GET /api/user/recipe-categories — skrivebeskyttet lesing av oppskriftskategoriene for vanlige brukere (samme
// katalog som /api/admin/recipe-categories, men uten admin-krav) — til kategorivelgeren i oppskriftsskjemaet.
export const GET = () =>
  apiRoute<RecipeCategory[]>("Kunne ikke hente oppskriftskategorier.", async (options) => {
    const categories = await agentExternal.get<RecipeCategory[]>(
      "/user/recipe-categories",
      options,
    );

    return { message: "Oppskriftskategorier hentet.", body: categories };
  });
