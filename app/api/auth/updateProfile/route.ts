import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { HttpResponse } from "@/lib/models/httpResponse";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { UpdateProfileRequest } from "@/lib/models/auth/updateProfileRequest";

export const PUT = async (request: Request) => {
  try {
    const body: UpdateProfileRequest = await request.json();

    // 1. Send oppdatering til Auth API
    const updatedProfile: UserProfileResponse = await agentAuth.updateProfile(body);

    // 2. Oppdater brukerdata i cookies
    await sessionManager.setUserData(updatedProfile);

    const successResponse: HttpResponse<UserProfileResponse> = {
      statusCode: 200,
      message: "Profilen ble oppdatert!",
      body: updatedProfile,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke oppdatere profilen.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};
