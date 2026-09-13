import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    // 1. Utfør OAuth2 Token Exchange via OpenIddict (/connect/token)
    const tokens = await agentAuth.login(body);

    // 2. Hent innlogget brukersin profil fra /account/deleteProfile med det ferske tokenet
    const meUrl = `${process.env.GATEWAY_URL}/auth/account/me`;
    const profileRes = await fetch(meUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!profileRes.ok) {
      const errorResponse: HttpResponse<undefined> = {
        statusCode: profileRes.status,
        message: "Kunne ikke hente brukerprofil etter innlogging.",
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: profileRes.status });
    }

    const userProfile: UserProfileResponse = await profileRes.json();

    // 3. Lagre tokens i HttpOnly-cookies og profil i tilgjengelig cookie
    await sessionManager.setSession(tokens, userProfile);

    // 4. Returner suksessrespons med UserProfileResponse i body
    const successResponse: HttpResponse<UserProfileResponse> = {
      statusCode: 200,
      message: "Innlogging vellykket!",
      body: userProfile,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ugyldig e-post eller passord.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};
