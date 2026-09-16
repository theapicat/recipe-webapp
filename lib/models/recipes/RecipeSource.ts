export type RecipeSourceType = "manual" | "scraped";

export interface RecipeSource {
  type: RecipeSourceType;
  // Fritekstreferanse, f.eks. kokebok-tittel. Redigerbar uansett type.
  reference?: string;
  // Kun satt for type "scraped" - låst, kan ikke fjernes av brukeren.
  url?: string;
  // Satt til true når brukeren har redigert en scrapet oppskrift etter import.
  isEditedFromSource?: boolean;
}
