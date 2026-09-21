// Næringsstoffgruppe, nøstet inn i hver NutrientDefinition (det finnes ikke noe eget gruppe-endepunkt).
export interface NutrientGroup {
  id: string;
  // Lowercase, f.eks. "vitamin c".
  name: string;
  sortOrder: number;
  // Satt for undergrupper ("fett" for fettsyregruppene, "vitaminer" for vitamin A-E). En hovedgruppe har ingen.
  parentGroup: NutrientGroup | null;
}
