import { Allergen } from "@/lib/models/ingredients/Allergen";
import { IngredientCategory } from "@/lib/models/ingredients/IngredientCategory";
import { SearchKeyword } from "@/lib/models/ingredients/SearchKeyword";
import { RecipeCategory } from "@/lib/models/recipes/RecipeCategory";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";

// Kobler hvert katalognavn (CatalogResource) til modellen backend bruker for det. Opprettelse sender
// Omit<T, "id"> (serveren tildeler id), oppdatering sender hele T med id.
export interface CatalogModelMap {
  "recipe-categories": RecipeCategory;
  "ingredient-categories": IngredientCategory;
  allergens: Allergen;
  "search-keywords": SearchKeyword;
  "unit-types": UnitType;
  units: Unit;
}

// Alle katalogmodeller har minst { id, name } — generisk kode (tabell, skjema) trenger ikke mer enn det.
export type CatalogItem = CatalogModelMap[keyof CatalogModelMap];
