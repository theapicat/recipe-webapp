export interface RecipeListItem {
  id: string;
  title: string;
  imageUrl?: string;
  categoryId: string;
  cookTimeMinutes: number;
  servings: number;
  isFavorite: boolean;
}
