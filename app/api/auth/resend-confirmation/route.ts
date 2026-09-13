import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import { ApiError } from "@/lib/agent/ApiError";

export async function POST() {
  try {
    const result = await agentAuth.resendConfirmation();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke sende bekreftelses-epost på nytt.";
    return NextResponse.json({ message: errorMessage }, { status });
  }
}
