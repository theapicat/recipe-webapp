export interface SearchKeyword {
  id: string;
  name: string;
  // --- Ønsket av frontend, leveres IKKE av backend ennå (se documentation/10, seksjon 7, B7). Valgfrie til da. ---
  /** Standardoppføring fra seed-data: kan aldri slettes. */
  isSystem?: boolean;
  /** Antall andre rader som bruker denne. > 0 betyr at den ikke kan slettes. */
  usageCount?: number;
}
