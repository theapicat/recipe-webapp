export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  description: string;
  timerMinutes?: number;
}
