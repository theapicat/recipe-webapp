// Én rad per næringsstoff. quantity >= 0, per 100 g spiselig del.
export interface IngredientNutrientValueRequest {
  nutrientDefinitionId: string;
  quantity: number;
  sourceId?: string | null;
}
