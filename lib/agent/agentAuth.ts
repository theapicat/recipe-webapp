import { agentExternal } from "@/lib/agent/agentExternal";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";
import { LoginRequest } from "@/lib/models/auth/loginRequest";
import { RegisterRequest } from "@/lib/models/auth/registerRequest";
import { UpdateProfileRequest } from "@/lib/models/auth/updateProfileRequest";
import { ChangePasswordRequest } from "@/lib/models/auth/changePasswordRequest";
import { SetPasswordRequest } from "@/lib/models/auth/setPasswordRequest";
import { ConfirmEmailRequest } from "@/lib/models/auth/confirmEmailRequest";
import { RecoverPasswordRequest } from "@/lib/models/auth/recoverPasswordRequest";
import { ResetPasswordRequest } from "@/lib/models/auth/resetPasswordRequest";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

const BASE_URL = process.env.AUTH_API;

if (!BASE_URL) {
  throw new Error("Miljøvariabelen AUTH_API er ikke definert.");
}

export const agentAuth = {
  // --- 1. INNLOGGING (OAuth2 Password Grant) ---
  login: async (data: LoginRequest): Promise<OpenIddictTokenResponse> => {
    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("username", data.email);
    body.append("password", data.password);
    body.append("client_id", "recipe-web-app");

    const response = await agentExternal.postForm(`${BASE_URL}/connect/token`, body);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || errorData.error || "Innlogging mislyktes.");
    }

    return await response.json();
  },

  // --- 2. TOKEN REFRESH (OAuth2 Refresh Token Grant) ---
  refresh: async (): Promise<OpenIddictTokenResponse> => {
    const refreshToken = await sessionManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Ingen refresh token tilgjengelig.");
    }

    const body = new URLSearchParams();
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", refreshToken);
    body.append("client_id", "recipe-web-app");

    const response = await agentExternal.postForm(`${BASE_URL}/connect/token`, body);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || errorData.error || "Kunne ikke fornye token.");
    }

    return await response.json();
  },

  // --- 3. REGISTRERING ---
  register: async (data: RegisterRequest): Promise<UserProfileResponse> => {
    const body = new URLSearchParams();
    body.append("Email", data.email);
    body.append("Password", data.password);
    body.append("FirstName", data.firstName);
    body.append("LastName", data.lastName);

    const response = await agentExternal.postForm(`${BASE_URL}/account/register`, body);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registrering mislyktes.");
    }

    return await response.json(); // Returnerer ren UserProfileResponse
  },

  // --- 4. HENT PROFIL ---
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await agentExternal.get(`${BASE_URL}/account/me`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Kunne ikke hente brukerprofil.");
    }

    return await response.json();
  },

  // --- 5. OPPDATER PROFIL ---
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const response = await agentExternal.put(`${BASE_URL}/account/profile`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Oppdatering av profil mislyktes.");
    }

    return await response.json();
  },

  // --- 6. ENDRE PASSORD (For brukere med eksisterende passord) ---
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/change-password`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Endring av passord mislyktes.");
    }

    return await response.json();
  },

  // --- 7. OPPRETT PASSORD (For Google-brukere uten lokalt passord) ---
  setPassword: async (data: SetPasswordRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/set-password`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Opprettelse av passord mislyktes.");
    }

    return await response.json();
  },

  // --- 8. FULLFØR VELKOMST ---
  completeWelcome: async (): Promise<UserProfileResponse> => {
    const response = await agentExternal.get(`${BASE_URL}/account/complete-welcome`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Kunne ikke fullføre velkomstreisen.");
    }

    return await response.json();
  },

  // --- 9. SEND BEKREFTELSE PÅ NYTT (Innlogget bruker) ---
  resendConfirmation: async (): Promise<{ message: string; confirmationToken?: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/resend-confirmation`, {});

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Kunne ikke sende bekreftelsese-post på nytt.");
    }

    return await response.json();
  },

  // --- 10. BEKREFT E-POST (Anonym - via e-postlenke) ---
  confirmEmail: async (data: ConfirmEmailRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/confirm-email`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Ugyldig eller utløpt bekreftelseskode.");
    }

    return await response.json();
  },

  // --- 11. RECOVERY / GLEMT PASSORD ---
  recovery: async (
    data: RecoverPasswordRequest,
  ): Promise<{ message: string; resetToken?: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/recover`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Kunne ikke sende gjenopprettingslenke.");
    }

    return await response.json();
  },

  // --- 12. TILBAKESTILL PASSORD (Anonym - via e-postlenke) ---
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await agentExternal.post(`${BASE_URL}/account/reset-password`, data);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Tilbakestilling av passord mislyktes.");
    }

    return await response.json();
  },

  // --- 13. SLETT PROFIL ---
  deleteProfile: async (): Promise<{ message: string }> => {
    const response = await agentExternal.delete(`${BASE_URL}/account/me`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Sletting av konto mislyktes.");
    }

    return await response.json();
  },
};
