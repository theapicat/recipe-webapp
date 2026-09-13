// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";

export async function GET() {
  try {
    const profile = await agentAuth.getProfile();

    // Synkroniserer cookien slik at initialUser i Server Components er oppdatert
    await sessionManager.setUserData(profile);

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke hente brukerprofil.";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
