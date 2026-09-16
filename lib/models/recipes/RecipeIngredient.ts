// Peker på nøyaktig én av ingredientId eller unconfirmedIngredientId, aldri begge/ingen.
export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId?: string;
  unconfirmedIngredientId?: string;
  amount: number;
  unitId: string;
  note?: string;
}
