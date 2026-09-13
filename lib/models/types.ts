export type UserRoleType = "admin" | "user";

/**
 * Normaliserer en rolleverdi fra en ekstern kilde (JWT-claim, Gateway-respons,
 * Google-callback query-param) til appens interne standard: alltid små bokstaver.
 * Backend sender i dag "Admin"/"User" med stor forbokstav — se BACKEND_REQUIREMENTS.md
 * for planen om å flytte normaliseringen dit i stedet.
 */
export const normalizeRole = (role: string | null | undefined): UserRoleType =>
  role?.toLowerCase() === "admin" ? "admin" : "user";
