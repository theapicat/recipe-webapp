import { NextResponse } from "next/server";
import { HttpResponse } from "@/lib/models/httpResponse";
import { SendUserEmailAdminRequest } from "@/lib/models/admin/users/SendUserEmailAdminRequest";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";

export const POST = async (request: Request) => {
  try {
    const body: SendUserEmailAdminRequest = await request.json();
    const result = await agentAuthAdmin.sendUserEmail(body);

    const successResponse: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "E-posten ble sendt til brukeren.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Kunne ikke sende e-posten. Vennligst prøv igjen senere.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};