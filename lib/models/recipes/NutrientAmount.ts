// nutrientId refererer til NutrientDefinition.id (tekstkode, f.eks. "Fett", "Vit C").
export interface NutrientAmount {
  nutrientId: string;
  total: number;
  perServing: number;
}
