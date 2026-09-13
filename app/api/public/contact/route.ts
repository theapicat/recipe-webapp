import { NextResponse } from "next/server";
import { HttpResponse } from "@/lib/models/httpResponse";
import { ContactRequest } from "@/lib/models/public/ContactRequest";
import { agentExternal } from "@/lib/agent/agentExternal";

export const POST = async (request: Request) => {
  try {
    const body: ContactRequest = await request.json();
    const url = `${process.env.GATEWAY_URL}/public/contact-form`;

    const response = await agentExternal.post(url, body);

    // Hvis backend returnerer noe annet enn 2xx OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        "Meldingen kunne ikke sendes. Vennligst prøv igjen senere.";

      const failureResponse: HttpResponse<undefined> = {
        statusCode: response.status,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(failureResponse, { status: response.status });
    }

    // Ved suksess (200 OK)
    const successResponse: HttpResponse<undefined> = {
      statusCode: 200,
      message: "Takk for din henvendelse! Meldingen er sendt.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke sende meldingen.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};