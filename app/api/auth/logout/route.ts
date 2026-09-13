import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";

export const POST = async () => {
  try {
    // Best-effort — kaster aldri, se agentAuth.revokeToken(). Må skje FØR removeSession()
    // siden den leser refreshToken-cookien.
    await agentAuth.revokeToken();
    await sessionManager.removeSession();

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: "Utlogging vellykket!",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    const errorResponse: HttpResponse<undefined> = {
      statusCode: 500,
      message: "Det oppstod en feil under utlogging.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
};
