// Brukerens egen ingrediens som ikke finnes i den offisielle katalogen ennå. Kun synlig/brukbar for brukeren
// som opprettet den, til en admin godkjenner den, slår den sammen med en eksisterende eller avviser den.
export type UnconfirmedIngredientStatus =
  "NotRequested" | "Pending" | "Approved" | "Merged" | "Rejected";

export interface UnconfirmedIngredient {
  id: string;
  name: string;
  createdByUserId: string;
  // NB: reviewStatus, ikke status.
  reviewStatus: UnconfirmedIngredientStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  // Kun satt når Approved/Merged: den offisielle ingrediensen.
  resolvedIngredientId: string | null;
  createdAt: string;
}
