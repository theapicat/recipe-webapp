export interface AdminUserDetails {
  userId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasPassword: boolean;
  isGoogleAccount: boolean;
  isEmailConfirmed: boolean;
  welcomeCompleted: boolean;
  isLocked: boolean;
  lockoutEnd?: string | null;
  lockoutReason: string;
  lockoutReasonDetails?: string | null;
  accessFailedCount: number;
  createdAt: string;
  lastModifiedAt: string;
  lastLoginAt?: string | null;

  // Tidsstempler for kontolivssyklus
  confirmation7DaysReminderSentAt?: string | null;
  confirmation14DaysLockedSentAt?: string | null;
  inactivityWarning6MonthsSentAt?: string | null;
  inactivity1YearLockedSentAt?: string | null;
}
