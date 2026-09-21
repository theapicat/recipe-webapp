import { RecipeIngredientRequest } from "@/lib/models/recipes/RecipeIngredientRequest";
import { RecipeSourceRequest } from "@/lib/models/recipes/RecipeSourceRequest";
import { RecipeStepRequest } from "@/lib/models/recipes/RecipeStepRequest";

// Body for POST og PUT /recipes. PUT erstatter ALT (steg og ingredienslinjer får nye id-er), så send
// alltid hele oppskriften. Ingen id-er og ingen utledede felt (cookTimeMinutes).
export interface RecipeRequest {
  // Ikke tom, maks 200 tegn.
  title: string;
  // Ikke tom, maks 5 000 tegn.
  description: string;
  categoryId: string;
  // 1-1000.
  servings: number;
  // Må være http(s).
  imageUrl?: string | null;
  imageAttribution?: string | null;
  source?: RecipeSourceRequest;
  // Minst ett steg, maks 100.
  steps: RecipeStepRequest[];
  // Minst én linje, maks 100.
  ingredients: RecipeIngredientRequest[];
}
