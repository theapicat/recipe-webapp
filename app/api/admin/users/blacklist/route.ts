import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { HttpResponse } from "@/lib/models/httpResponse";
import {BlacklistedEntry} from "@/lib/models/admin/users/DeleteAndBlacklistUserAdminRequest";

// GET /api/admin/blacklist
export const GET = async () => {
  try {
    const data = await agentAuthAdmin.getBlacklist();

    const response: HttpResponse<BlacklistedEntry[]> = {
      statusCode: 200,
      message: "Svartelisten ble hentet.",
      body: data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke hente svartelisten.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};

// POST /api/admin/blacklist
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const result = await agentAuthAdmin.addToBlacklist(body);

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Oppføringen ble lagt til i svartelisten.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke legge til i svartelisten.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};