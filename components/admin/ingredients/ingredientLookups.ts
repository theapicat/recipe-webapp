import { Allergen } from "@/lib/models/ingredients/Allergen";
import { IngredientCategory } from "@/lib/models/ingredients/IngredientCategory";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";
import { SearchKeyword } from "@/lib/models/ingredients/SearchKeyword";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";

// Alt visningen og editoren trenger for å oversette id-er til navn og fylle nedtrekkslister. Bygges én gang i
// IngredientManager fra katalogene, næringsstoffkatalogen og ingredienslisten.
export interface IngredientLookups {
  categories: IngredientCategory[];
  allergens: Allergen[];
  keywords: SearchKeyword[];
  units: Unit[];
  unitTypes: UnitType[];
  definitions: NutrientDefinition[];
  ingredients: IngredientListItem[];
}

export const nameOf = (
  items: { id: string; name: string }[],
  id: string | null,
): string | undefined => (id ? items.find((item) => item.id === id)?.name : undefined);
