import { IngredientNutrientValue } from "@/lib/models/ingredients/IngredientNutrientValue";
import { IngredientPortion } from "@/lib/models/ingredients/IngredientPortion";

export interface Ingredient {
  id: string;
  name: string;
  categoryId: string;
  allergenIds: string[];
  primaryUnitTypeId: string;
  defaultUnitId: string;
  energyKcal: number;
  energyKj?: number;
  // Andel av matvaren som er spiselig (f.eks. 97 for agurk).
  ediblePartPercent?: number;
  searchKeywordIds: string[];
  // Kun satt for offisielt importerte ingredienser - lar brukeren slå opp kilden.
  sourceId?: string;
  sourceUrl?: string;
  nutrientValues: IngredientNutrientValue[];
  portions: IngredientPortion[];
  // false for adminlagte innslag som venter på fullstendige nærings-/allergendata.
  isVerified: boolean;
}
