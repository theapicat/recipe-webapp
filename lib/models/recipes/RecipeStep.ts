export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  description: string;
  // null = ingen timer. Timerne er rent klientside.
  timerMinutes: number | null;
}
