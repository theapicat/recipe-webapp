import { NextResponse } from "next/server";
import { agentAuth } from "@/lib/agent/agentAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await agentAuth.setPassword(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke opprette passord.";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
