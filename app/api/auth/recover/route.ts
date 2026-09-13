import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";
import { ApiError } from "@/lib/agent/ApiError";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await agentAuth.recovery(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke sende gjenopprettingslenke.";
    return NextResponse.json({ message: errorMessage }, { status });
  }
}
