// Kun én rad per (ingredientId, nutrientDefinitionId) som faktisk er målt - ikke alle
// ingredienser har verdi for alle næringsstoffer.
export interface IngredientNutrientValue {
  id: string;
  ingredientId: string;
  // Refererer til NutrientDefinition.id (tekstkode, f.eks. "Fett", "Vit C").
  nutrientDefinitionId: string;
  // Per 100 g spiselig del.
  quantity: number;
  // Kildens egen referansekode for denne spesifikke verdien (sporbarhet utover Ingredient.sourceId).
  sourceId: string | null;
}
