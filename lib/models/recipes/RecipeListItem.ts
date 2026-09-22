// Svaret fra GET /user/recipes - hele listen i ett kall, sortert på tittel. Søk og filtrering gjøres klientside.
export interface RecipeListItem {
  id: string;
  title: string;
  imageUrl: string | null;
  categoryId: string;
  cookTimeMinutes: number;
  servings: number;
  isFavorite: boolean;
}
