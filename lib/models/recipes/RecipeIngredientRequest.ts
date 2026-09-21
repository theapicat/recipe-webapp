// Nøyaktig én av ingredientId/unconfirmedIngredientId må være satt. Rekkefølgen i lista bevares.
export interface RecipeIngredientRequest {
  ingredientId?: string;
  // Må være brukerens egen, og ikke Approved/Merged (bruk da den offisielle ingrediensen).
  unconfirmedIngredientId?: string;
  // Utelat eller 0 = "etter smak". Negativt gir 400.
  amount?: number;
  unitId: string;
  note?: string | null;
}
