// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import { ApiError } from "@/lib/agent/ApiError";
import sessionManager from "@/lib/session/sessionManager";

export async function GET() {
  try {
    const profile = await agentAuth.getProfile();

    // Synkroniserer cookien slik at initialUser i Server Components er oppdatert
    await sessionManager.setUserData(profile);

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke hente brukerprofil.";
    return NextResponse.json({ message: errorMessage }, { status });
  }
}
