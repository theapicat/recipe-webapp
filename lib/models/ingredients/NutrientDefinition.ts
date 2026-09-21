import { NutrientGroup } from "@/lib/models/ingredients/NutrientGroup";

// Skrivebeskyttet katalog (57 stk) - kan ikke opprettes, endres eller slettes av noen. Endres aldri under kjøring,
// så den kan trygt gjenbrukes gjennom hele sesjonen.
export interface NutrientDefinition {
  // Kildens egen tekstkode (f.eks. "Fett", "Vit C", "Mono+Di"), ikke en Guid. URL-encode i stier.
  id: string;
  // Beholder kildens store/små bokstaver (f.eks. "Salt (NaCl)").
  name: string;
  unitId: string;
  // Enhetens forkortelse til visning, f.eks. "mg".
  unit: string;
  unitTypeId: string;
  decimalPrecision: number;
  group: NutrientGroup;
  sourceUrl: string | null;
  // 1-57. Lista kommer ferdig sortert, gruppe for gruppe.
  sortOrder: number;
}
