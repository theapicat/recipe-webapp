import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { HttpResponse } from "@/lib/models/httpResponse";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";

// GET /api/admin/users/[id]
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const userDetails = await agentAuthAdmin.getUserDetails(id);

    const response: HttpResponse<AdminUserDetails> = {
      statusCode: 200,
      message: "Brukerdetaljer hentet med hell.",
      body: userDetails,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke hente brukerdetaljer.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};
