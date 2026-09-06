import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { HttpResponse } from "@/lib/models/httpResponse";

// DELETE /api/admin/blacklist/[id]
export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const result = await agentAuthAdmin.removeFromBlacklist(id);

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Oppføringen ble fjernet fra svartelisten.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke fjerne fra svartelisten.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};