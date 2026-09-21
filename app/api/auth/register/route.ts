import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";
import { RegisterRequest } from "@/lib/models/auth/registerRequest";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export const POST = (request: Request) =>
  apiRoute<UserProfileResponse>("Kunne ikke opprette bruker.", async (options) => {
    const data: RegisterRequest = await request.json();

    // 1. Opprett bruker i Auth API (form-encoded, feltnavn med stor forbokstav)
    const registration = new URLSearchParams({
      Email: data.email,
      Password: data.password,
      FirstName: data.firstName,
      LastName: data.lastName,
    });

    const userProfile = await agentExternal.postForm<UserProfileResponse>(
      "/auth/account/register",
      registration,
      options,
    );

    // 2. Logg inn brukeren automatisk (samme Password Grant som app/api/auth/login) for å få tokens
    const credentials = new URLSearchParams({
      grant_type: "password",
      username: data.email,
      password: data.password,
      client_id: "recipe-web-app",
    });

    const tokens = await agentExternal.postForm<OpenIddictTokenResponse>(
      "/auth/connect/token",
      credentials,
      { errorMessage: "Innlogging etter registrering mislyktes." },
    );

    // 3. Lagre tokens (HttpOnly-cookies) og brukerprofil i sesjonen
    await sessionManager.setSession(tokens, userProfile);

    return { message: "Registrering vellykket!", body: userProfile };
  });
