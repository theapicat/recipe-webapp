import { RecipeIngredient } from "@/lib/models/recipes/RecipeIngredient";
import { RecipeSource } from "@/lib/models/recipes/RecipeSource";
import { RecipeStep } from "@/lib/models/recipes/RecipeStep";

// Svaret fra GET /user/recipes/{id}, og fra 201/200 ved opprettelse/oppdatering.
export interface Recipe {
  id: string;
  ownerUserId: string;
  // Lagres lowercase i backend - kapitaliser for visning.
  title: string;
  description: string;
  categoryId: string;
  // Utledet: summen av timerMinutes for stegene som har en timer. Sendes aldri.
  cookTimeMinutes: number;
  servings: number;
  imageUrl: string | null;
  imageAttribution: string | null;
  isFavorite: boolean;
  // Sortert på sortOrder.
  ingredients: RecipeIngredient[];
  // Sortert på stepNumber.
  steps: RecipeStep[];
  source: RecipeSource;
  createdAt: string;
  updatedAt: string;
}
