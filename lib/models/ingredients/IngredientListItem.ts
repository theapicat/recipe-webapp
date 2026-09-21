// Svaret fra GET /ingredients (søk) - lett variant uten næringsverdier og porsjoner.
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
}
