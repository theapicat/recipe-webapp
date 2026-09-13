import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { ApiError } from "@/lib/agent/ApiError";
import { HttpResponse } from "@/lib/models/httpResponse";

// POST /api/admin/users/unlock
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const result = await agentAuthAdmin.unlockUser(body);

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Sperren har blitt fjernet.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke gjenåpne brukeren.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status });
  }
};
