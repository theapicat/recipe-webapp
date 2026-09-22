import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { UnitType } from "@/lib/models/units/UnitType";

// GET /api/user/unit-types — skrivebeskyttet lesing av enhetstypene for vanlige brukere (samme katalog som
// /api/admin/unit-types, men uten admin-krav). Brukt til å begrense enhetsvelgeren i oppskriftsskjemaet til
// enheter som faktisk gir mening for den valgte ingrediensen (samme enhetstype som ingrediensens
// primaryUnitTypeId, pluss «antall»-enheter) — se components/recipes/recipeLookups.ts, unitsForIngredient().
//
// Gateway-stien er ANTATT, samme mønster som /user/recipe-categories og /user/units — ikke bekreftet mot
// backend, se backend-notes.md, B16.
export const GET = () =>
  apiRoute<UnitType[]>("Kunne ikke hente enhetstyper.", async (options) => {
    const unitTypes = await agentExternal.get<UnitType[]>("/user/unit-types", options);

    return { message: "Enhetstyper hentet.", body: unitTypes };
  });
