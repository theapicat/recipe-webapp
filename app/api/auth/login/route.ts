import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";
import { LoginRequest } from "@/lib/models/auth/loginRequest";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export const POST = (request: Request) =>
  apiRoute<UserProfileResponse>("Ugyldig e-post eller passord.", async () => {
    const data: LoginRequest = await request.json();

    // 1. OAuth2 Password Grant mot OpenIddict (/connect/token)
    const credentials = new URLSearchParams({
      grant_type: "password",
      username: data.email,
      password: data.password,
      client_id: "recipe-web-app",
    });

    const tokens = await agentExternal.postForm<OpenIddictTokenResponse>(
      "/auth/connect/token",
      credentials,
      { errorMessage: "Innlogging mislyktes." },
    );

    // 2. Hent profilen med det ferske tokenet (token-cookien er ikke satt ennå)
    const userProfile = await agentExternal.get<UserProfileResponse>("/auth/account/me", {
      token: tokens.access_token,
      errorMessage: "Kunne ikke hente brukerprofil etter innlogging.",
    });

    // 3. Lagre tokens i HttpOnly-cookies og profilen i en lesbar cookie
    await sessionManager.setSession(tokens, userProfile);

    return { message: "Innlogging vellykket!", body: userProfile };
  });
