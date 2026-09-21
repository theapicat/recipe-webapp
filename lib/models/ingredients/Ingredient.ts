import { IngredientNutrientValue } from "@/lib/models/ingredients/IngredientNutrientValue";
import { IngredientPortion } from "@/lib/models/ingredients/IngredientPortion";

// Svaret fra GET /ingredients/{id} - den fulle ingrediensen, alltid ferskt fra databasen.
// Søkelisten (GET /ingredients) bruker den lettere IngredientListItem.
export interface Ingredient {
  id: string;
  // Lagres lowercase i backend - kapitaliser for visning.
  name: string;
  categoryId: string;
  allergenIds: string[];
  primaryUnitTypeId: string;
  defaultUnitId: string;
  // Per 100 g spiselig del.
  energyKcal: number;
  energyKj: number | null;
  // Andel av matvaren som er spiselig (f.eks. banan 66, egg 88). null = ukjent.
  ediblePartPercent: number | null;
  searchKeywordIds: string[];
  // Kun satt for offisielt importerte ingredienser - lar brukeren slå opp kilden.
  sourceId: string | null;
  sourceUrl: string | null;
  // Satt når ingrediensen er en variant av en annen ingrediens.
  variantOfIngredientId: string | null;
  // Sparsom: kun målte næringsstoffer (0 = målt til null, mangler = ukjent).
  nutrientValues: IngredientNutrientValue[];
  portions: IngredientPortion[];
  // false for ingredienser som venter på fullstendige nærings-/allergendata (alle seedede er false i dag).
  isVerified: boolean;
  // Ønsket av frontend, leveres IKKE av backend ennå (se documentation/10, seksjon 7, B7): antall andre rader som bruker
  // ingrediensen (oppskrifter, varianter, ...). > 0 betyr at den ikke kan slettes.
  usageCount?: number;
  // Ønsket av frontend, leveres IKKE av backend ennå (se documentation/10, seksjon 7, B2): true for offisielle ingredienser
  // (importert fra kilden), false for egne. Til backend leverer det, utleder frontend det fra `sourceId !== null`.
  isOfficial?: boolean;
}
