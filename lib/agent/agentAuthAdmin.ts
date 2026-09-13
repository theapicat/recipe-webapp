import { agentExternal } from "@/lib/agent/agentExternal";
import { ApiError } from "@/lib/agent/ApiError";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";
import { AdminUpdateUserRequest } from "@/lib/models/admin/users/AdminUpdateUserRequest";
import { LockUserRequest } from "@/lib/models/admin/users/LockUserRequest";
import { UnlockUserRequest } from "@/lib/models/admin/users/UnlockUserRequest";
import { ResendConfirmationAdminRequest } from "@/lib/models/admin/users/ResendConfirmationAdminRequest";
import { ResetPasswordAdminRequest } from "@/lib/models/admin/users/ResetPasswordAdminRequest";
import { DeleteUserAdminRequest } from "@/lib/models/admin/users/DeleteUserAdminRequest";
import { AddBlacklistRequest } from "@/lib/models/admin/users/AddBlacklistRequest";
import { SendUserEmailAdminRequest } from "@/lib/models/admin/users/SendUserEmailAdminRequest";
import { DeleteAndBlacklistUserAdminRequest } from "@/lib/models/admin/users/DeleteAndBlacklistUserAdminRequest";
import { BlacklistedEntry } from "@/lib/models/admin/users/BlacklistedEntry";

const GATEWAY_URL = process.env.GATEWAY_URL;

if (!GATEWAY_URL) {
  throw new Error("Miljøvariabelen GATEWAY_URL er ikke definert.");
}

// Gatewayen ruter alt under /auth (inkl. /auth/admin/*) til recipe-authentication-api
const BASE_URL = `${GATEWAY_URL}/auth`;

export const agentAuthAdmin = {
  // --- 1. HENT ALLE BRUKERLISTE ---
  getUsers: async (): Promise<AdminUserListItem[]> => {
    const response = await agentExternal.get(`${BASE_URL}/admin/users`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Kunne ikke hente brukerliste.", response.status);
    }

    return await response.json();
  },

  // --- 2. HENT DETALJERT BRUKERPROFIL ---
  getUserDetails: async (userId: string): Promise<AdminUserDetails> => {
    const response = await agentExternal.get(`${BASE_URL}/admin/users/${userId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Kunne ikke hente brukerdetaljer.", response.status);
    }

    return await response.json();
  },

  // --- 3. REDIGER BRUKERPERSONALIA ---
  updateUser: async (data: AdminUpdateUserRequest): Promise<{ message: string }> => {
    const response = await agentExternal.put(`${BASE_URL}/admin/users`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Oppdatering av bruker mislyktes.", response.status);
    }

    return await response.json();
  },

  // --- 4. SPERR BRUKER MANUELT (Lock) ---
  lockUser: async (data: LockUserRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/lock`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Kunne ikke sperre brukeren.", response.status);
    }

    return await response.json();
  },

  // --- 5. GJENÅPNE SPERRET BRUKER (Unlock) ---
  unlockUser: async (data: UnlockUserRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/unlock`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Kunne ikke gjenåpne brukeren.", response.status);
    }

    return await response.json();
  },

  // --- 6. MANUELL BEKREFTELSE AV E-POST ---
  manuallyConfirmEmail: async (
    data: ResendConfirmationAdminRequest,
  ): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/confirm-email`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Manuell bekreftelse av e-post mislyktes.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 7. SEND BEKREFTELSESE-POST PÅ VEGNE AV BRUKER ---
  resendConfirmation: async (
    data: ResendConfirmationAdminRequest,
  ): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/resend-confirmation`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Kunne ikke sende bekreftelsese-post.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 8. SEND PASSORD-TILBAKESTILLING PÅ VEGNE AV BRUKER ---
  sendPasswordReset: async (data: ResetPasswordAdminRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(
      `${BASE_URL}/admin/users/reset-password-request`,
      data,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Kunne ikke sende tilbakestillingslenke.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 9. SEND MANUELL E-POST TIL BRUKER ---
  sendUserEmail: async (data: SendUserEmailAdminRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/send-email`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Kunne ikke sende e-post til brukeren.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 10. SLETT BRUKER (Admin-sletting) ---
  deleteUser: async (data: DeleteUserAdminRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/delete`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Sletting av bruker mislyktes.", response.status);
    }

    return await response.json();
  },

  // --- 11. SLETT OG SVARTELIST BRUKER ---
  deleteAndBlacklistUser: async (
    data: DeleteAndBlacklistUserAdminRequest,
  ): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/users/delete-and-blacklist`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Sletting og svartelisting av bruker mislyktes.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 12. HENT SVARTELISTE ---
  getBlacklist: async (): Promise<BlacklistedEntry[]> => {
    const response = await agentExternal.get(`${BASE_URL}/admin/blacklist`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Kunne ikke hente svartelisten.", response.status);
    }

    return await response.json();
  },

  // --- 13. LEGG TIL I SVARTELISTE (DIREKTE) ---
  addToBlacklist: async (data: AddBlacklistRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/admin/blacklist`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Kunne ikke legge til i svartelisten.",
        response.status,
      );
    }

    return await response.json();
  },

  // --- 14. FJERN FRA SVARTELISTE ---
  removeFromBlacklist: async (id: string): Promise<{ message: string }> => {
    const response = await agentExternal.delete(`${BASE_URL}/admin/blacklist/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Kunne ikke fjerne fra svartelisten.",
        response.status,
      );
    }

    return await response.json();
  },
};
