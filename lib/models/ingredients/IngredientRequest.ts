import { IngredientNutrientValueRequest } from "@/lib/models/ingredients/IngredientNutrientValueRequest";
import { IngredientPortionRequest } from "@/lib/models/ingredients/IngredientPortionRequest";

// Body for admin POST/PUT /ingredients og for godkjenning av en ubekreftet ingrediens. Ingen id-er.
// PUT erstatter alle barn (næringsverdier og porsjoner får nye id-er), så send alltid hele settet.
export interface IngredientRequest {
  name: string;
  categoryId: string;
  primaryUnitTypeId: string;
  defaultUnitId: string;
  // >= 0.
  energyKcal: number;
  energyKj?: number | null;
  ediblePartPercent?: number | null;
  sourceId?: string | null;
  sourceUrl?: string | null;
  variantOfIngredientId?: string | null;
  // Standard false.
  isVerified?: boolean;
  allergenIds?: string[];
  searchKeywordIds?: string[];
  nutrientValues?: IngredientNutrientValueRequest[];
  portions?: IngredientPortionRequest[];
}
