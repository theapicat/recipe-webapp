export interface AdminUserListItem {
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailConfirmed: boolean;
  isLocked: boolean;
  isGoogleAccount: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}
