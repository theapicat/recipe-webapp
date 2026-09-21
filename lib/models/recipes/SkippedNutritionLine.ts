// ToTaste: "etter smak" teller som ingenting. Unconfirmed: brukerens egen ingrediens har ingen næringsdata.
// NoConversion: enheten kan ikke omregnes til gram for denne ingrediensen - foreslå en annen enhet.
export type SkippedNutritionReason = "ToTaste" | "Unconfirmed" | "NoConversion";

export interface SkippedNutritionLine {
  recipeIngredientId: string;
  name: string;
  reason: SkippedNutritionReason;
}
