// Enhet -> gram av den spiselige delen (1 stk banan = 120 g). gramsPerPortion > 0.
export interface IngredientPortionRequest {
  unitId: string;
  gramsPerPortion: number;
}
