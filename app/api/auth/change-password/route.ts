import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import { HttpResponse } from "@/lib/models/httpResponse";
import { ChangePasswordRequest } from "@/lib/models/auth/changePasswordRequest";

export const POST = async (request: Request) => {
  try {
    const body: ChangePasswordRequest = await request.json();

    const result = await agentAuth.changePassword(body);

    const successResponse: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Passordet ble endret!",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke endre passord.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};
