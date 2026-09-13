import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";
import { RegisterRequest } from "@/lib/models/auth/registerRequest";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export const POST = async (request: Request) => {
  try {
    const body: RegisterRequest = await request.json();

    // 1. Opprett bruker i backend (mottar UserProfileResponse)
    const userProfile = await agentAuth.register(body);

    // 2. Logg inn brukeren automatisk for å få access- og refresh-tokens
    const tokens = await agentAuth.login({
      email: body.email,
      password: body.password,
    });

    // 3. Lagre tokens (HttpOnly cookies) og brukerprofil i sesjonen
    await sessionManager.setSession(tokens, userProfile);

    // 4. Returner suksessrespons
    const successResponse: HttpResponse<UserProfileResponse> = {
      statusCode: 200,
      message: "Registrering vellykket!",
      body: userProfile,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke opprette bruker.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};
