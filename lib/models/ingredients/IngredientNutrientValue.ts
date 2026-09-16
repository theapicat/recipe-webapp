// Kun én rad per (ingredientId, nutrientDefinitionId) som faktisk er målt - ikke alle
// ingredienser har verdi for alle næringsstoffer.
export interface IngredientNutrientValue {
  id: string;
  ingredientId: string;
  nutrientDefinitionId: string;
  quantity: number;
  // Kildens egen referansekode for denne spesifikke verdien (sporbarhet utover Ingredient.sourceId).
  sourceId?: string;
}
