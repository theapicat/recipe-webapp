import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";

// POST /api/auth/refresh
// Brukes av agentInternal til å fornye access-tokenet når et kall feiler med 401 — se
// documentation/03-auth-and-session.md for hele flyten. Kalles ALDRI direkte fra en komponent.
export const POST = async () => {
  try {
    const tokens = await agentAuth.refresh();

    await sessionManager.setToken(tokens.access_token, tokens.expires_in);
    if (tokens.refresh_token) {
      await sessionManager.setRefreshToken(tokens.refresh_token);
    }

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: "Token fornyet.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    // Refresh-tokenet er selv utløpt/ugyldig — ingen vits i å beholde resten av sesjonen
    await sessionManager.removeSession();

    const errorMessage = error instanceof Error ? error.message : "Sesjonen er utløpt.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 401,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 401 });
  }
};
