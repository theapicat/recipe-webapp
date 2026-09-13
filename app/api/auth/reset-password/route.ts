import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await agentAuth.resetPassword(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Tilbakestilling av passord mislyktes.";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
