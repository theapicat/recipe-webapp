// Enhet -> gram-konvertering per ingrediens (speiler Matvaretabellens "portions"-data),
// i stedet for en generell tetthetsberegning.
export interface IngredientPortion {
  id: string;
  ingredientId: string;
  unitId: string;
  gramsPerPortion: number;
}
