import { NutrientAmount } from "@/lib/models/recipes/NutrientAmount";
import { NutritionAmount } from "@/lib/models/recipes/NutritionAmount";
import { SkippedNutritionLine } from "@/lib/models/recipes/SkippedNutritionLine";

// Svaret fra GET /user/recipes/{id}/nutrition. Veiledende, ikke eksakt: beregnes ved hver forespørsel og lagres aldri.
export interface RecipeNutrition {
  recipeId: string;
  servings: number;
  // null når verdien er 0/ukjent.
  energyKcal: NutritionAmount | null;
  energyKj: NutritionAmount | null;
  // Kun næringsstoffer med verdi > 0, i katalogrekkefølge.
  nutrients: NutrientAmount[];
  countedIngredients: number;
  totalIngredients: number;
  skippedLines: SkippedNutritionLine[];
}
