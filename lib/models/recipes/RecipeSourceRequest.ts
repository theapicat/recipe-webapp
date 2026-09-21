// Kun fritekst-referansen kan settes av klienten. type/url eies av serveren.
export interface RecipeSourceRequest {
  reference?: string | null;
}
