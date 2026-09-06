import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { HttpResponse } from "@/lib/models/httpResponse";

// POST /api/admin/users/delete-and-blacklist
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const result = await agentAuthAdmin.deleteAndBlacklistUser(body);

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Brukeren har blitt slettet og e-posten er svartelistet.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Sletting og svartelisting mislyktes.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};