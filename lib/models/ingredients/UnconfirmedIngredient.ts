// En brukeroppgitt ingrediens som ikke finnes i den offisielle katalogen ennå.
// Ikke del av Ingredient-katalogen - kun synlig/brukbar for brukeren som opprettet den, til admin
// enten godkjenner den til en ekte Ingredient eller kobler oppskriften til en eksisterende.
export interface UnconfirmedIngredient {
  id: string;
  name: string;
  createdByUserId: string;
  // Brukeren har bedt om at admin finner offisielle nærings-/allergendata for denne.
  requestOfficialData: boolean;
  createdAt: string;
}
