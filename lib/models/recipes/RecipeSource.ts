// Backend serialiserer enums som strenger med stor forbokstav.
export type RecipeSourceType = "Manual" | "Scraped";

export interface RecipeSource {
  type: RecipeSourceType;
  // Fritekstreferanse, f.eks. kokebok-tittel. Redigerbar uansett type.
  reference: string | null;
  // Kun satt for type "Scraped" - låst, kan aldri endres av brukeren.
  url: string | null;
  // true når brukeren har redigert en skrapet oppskrift etter import. null for manuelle oppskrifter.
  isEditedFromSource: boolean | null;
}
