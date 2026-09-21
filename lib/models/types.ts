export type UserRoleType = "admin" | "user";

/**
 * Normaliserer en rolleverdi fra en ekstern kilde (JWT-claim, Gateway-respons,
 * Google-callback query-param) til appens interne standard: alltid små bokstaver.
 * Backend sender alltid små bokstaver ("admin"/"user"). Normaliseringen beholdes som forsvar mot
 * gamle cookies og uventede verdier.
 */
export const normalizeRole = (role: string | null | undefined): UserRoleType =>
  role?.toLowerCase() === "admin" ? "admin" : "user";
