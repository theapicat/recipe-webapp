import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";

// GET /api/user/ingredients — den lette, brukervendte ingredienslisten (uten næringsverdier/porsjoner), til bruk
// i ingrediensvelgeren i oppskriftsskjemaet. Egen rute fra /api/admin/ingredients: samme underliggende katalog,
// men admin-ruten krever admin-token og har et annet formål (full CRUD).
//
// Gateway-stien er ANTATT (`/user/ingredients`, samme mønster som /user/recipe-categories og /user/units) —
// ikke bekreftet mot backend (se backend-notes.md, B16). En eldre kommentar i IngredientListItem.ts antok en bar
// sti (`/ingredients`, uten /user-prefiks); den er sannsynligvis feil siden `/api/ingredients` (uten prefiks) gir
// 404 direkte fra Gatewayen, mens alt under `/api/user/**` og `/api/admin/**` uansett gir 401 uten token — dette
// skiller IKKE mellom "ruten finnes" og "ruten finnes ikke", så still er dette en antagelse, ikke en bekreftelse.
export const GET = () =>
  apiRoute<IngredientListItem[]>("Kunne ikke hente ingredienser.", async (options) => {
    const ingredients = await agentExternal.get<IngredientListItem[]>("/user/ingredients", options);

    return { message: "Ingredienser hentet.", body: ingredients };
  });
