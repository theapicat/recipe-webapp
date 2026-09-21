export interface CreateUnconfirmedIngredientRequest {
  name: string;
  // Standard false. true ber en admin om å vurdere ingrediensen (maks 10 ventende per bruker).
  requestReview?: boolean;
}
