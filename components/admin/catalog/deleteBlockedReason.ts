// Hvorfor en oppføring ikke kan slettes — eller null hvis den kan (så vidt frontend vet). Knappen deaktiveres og
// begrunnelsen vises i stedet for at brukeren får et 409 etter å ha trykket. Feltene kommer fra backend
// (documentation/10, seksjon 7, B7); mangler de, returneres null og backend sin 409 er siste skanse.
interface DeleteBlockInfo {
  isSystem?: boolean;
  usageCount?: number;
  // Klientside: antall varianter (ingredienser) som peker på denne, regnet ut fra hele listen.
  variantCount?: number;
}

export const deleteBlockedReason = ({
  isSystem,
  usageCount,
  variantCount,
}: DeleteBlockInfo): string | null => {
  if (isSystem) return "Standardoppføring — kan ikke slettes.";
  if (variantCount && variantCount > 0) {
    return `Har ${variantCount} ${variantCount === 1 ? "variant" : "varianter"} og kan ikke slettes.`;
  }
  if (usageCount && usageCount > 0) return `Er i bruk (${usageCount}) og kan ikke slettes.`;
  return null;
};
