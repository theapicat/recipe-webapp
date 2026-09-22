// Svaret fra GET /user/ingredients (søk) - lett variant uten næringsverdier og porsjoner. Antatt sti, ikke
// bekreftet mot backend ennå — se app/api/user/ingredients/route.ts og backend-notes.md, B16.
// Rekkefølgen er ikke garantert: sorter klientside.
export interface IngredientListItem {
  id: string;
  name: string;
  categoryId: string;
  primaryUnitTypeId: string;
  defaultUnitId: string;
  energyKcal: number;
  isVerified: boolean;
  variantOfIngredientId: string | null;
  allergenIds: string[];
  searchKeywordIds: string[];
  // Ønsket av frontend, leveres IKKE av backend ennå (se documentation/10, seksjon 7, B7): antall andre rader som bruker
  // ingrediensen (oppskrifter, varianter, ...). > 0 betyr at den ikke kan slettes.
  usageCount?: number;
  // Ønsket av frontend, leveres IKKE av backend ennå (se documentation/10, seksjon 7, B2): true for offisielle ingredienser
  // (importert fra kilden), false for egne. Til backend leverer det, utleder frontend det fra `sourceId !== null`.
  isOfficial?: boolean;
}
