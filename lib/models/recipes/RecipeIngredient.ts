// Peker på nøyaktig én av ingredientId eller unconfirmedIngredientId, aldri begge/ingen.
export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string | null;
  unconfirmedIngredientId: string | null;
  // 0 = "etter smak": vis teksten, ikke "0". Teller ikke i næringsberegningen.
  amount: number;
  unitId: string;
  note: string | null;
  sortOrder: number;
  // Skrivebeskyttet: ingrediensens (eller brukerens egen ubekreftede) navn, lowercase - ingen oppslag nødvendig.
  name: string | null;
}
