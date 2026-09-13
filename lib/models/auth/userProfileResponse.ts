import { UserRoleType } from "@/lib/models/types";

/**
 * Respons-DTO fra API-et (GET /api/auth/account/me, PUT /api/auth/account/profile osv.).
 */
export interface UserProfileResponse {
  userId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;

  // Google- og Passord-flagg
  hasPassword: boolean;
  isGoogleAccount: boolean;

  // Status & Metadata
  isEmailConfirmed: boolean;
  welcomeCompleted: boolean;
  isLocked: boolean;
  createdAt: string;
  lastModifiedAt?: string | null;
  lastLoginAt?: string | null;
}
