import { RecipeIngredient } from "@/lib/models/recipes/RecipeIngredient";
import { RecipeSource } from "@/lib/models/recipes/RecipeSource";
import { RecipeStep } from "@/lib/models/recipes/RecipeStep";

export interface Recipe {
  id: string;
  ownerUserId: string;
  title: string;
  description: string;
  categoryId: string;
  // Summen av timerMinutes for stegene som har en timer - ikke et separat inntastet felt.
  cookTimeMinutes: number;
  servings: number;
  imageUrl?: string;
  imageAttribution?: string;
  isFavorite: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  source: RecipeSource;
  createdAt: string;
  updatedAt: string;
}
