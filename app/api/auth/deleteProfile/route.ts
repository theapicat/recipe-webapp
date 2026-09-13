import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import { ApiError } from "@/lib/agent/ApiError";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";

export const DELETE = async () => {
  try {
    // 1. Slett i backend
    await agentAuth.deleteProfile();

    // 2. Fjerner cookies/sesjon
    await sessionManager.removeSession();

    const successResponse: HttpResponse<undefined> = {
      statusCode: 200,
      message: "Kontoen din er nå slettet.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke slette kontoen.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status });
  }
};
