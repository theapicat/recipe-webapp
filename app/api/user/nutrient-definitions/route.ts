import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";

// GET /api/user/nutrient-definitions — næringsstoffkatalogen (57, sortert på sortOrder, gruppen nøstet i hvert stoff).
// Skrivebeskyttet og endres aldri under kjøring. Admin-token godtas på /user/**-endepunktene.
export const GET = () =>
  apiRoute<NutrientDefinition[]>("Kunne ikke hente næringsstoffene.", async (options) => {
    const definitions = await agentExternal.get<NutrientDefinition[]>(
      "/user/nutrient-definitions",
      options,
    );

    return { message: "Næringsstoffene ble hentet.", body: definitions };
  });
