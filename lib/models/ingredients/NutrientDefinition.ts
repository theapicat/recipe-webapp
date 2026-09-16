// Speiler Matvaretabellens næringsstoff-katalog. id er kildens egen kode (f.eks. "Fett", "Vit C"),
// ikke en generert Guid - katalogen importeres derfra, koden er allerede stabil og unik.
export interface NutrientDefinition {
  id: string;
  name: string;
  unit: string;
  decimalPrecision: number;
  // Selvreferanse for hierarki (f.eks. "Mettet" -> parentId "Fett"). Ingen parentId = toppnivå/basic-visning.
  parentId?: string;
  sourceUrl?: string;
}
