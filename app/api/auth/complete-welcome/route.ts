import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import sessionManager from "@/lib/session/sessionManager";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export async function GET() {
  try {
    const updatedUser: UserProfileResponse = await agentAuth.completeWelcome();

    // Oppdaterer cookien på server-siden slik at framtidige requests har fersk profil
    await sessionManager.setUserData(updatedUser);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke fullføre velkomstreisen.";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
