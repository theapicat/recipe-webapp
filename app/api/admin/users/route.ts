import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { ApiError } from "@/lib/agent/ApiError";
import { HttpResponse } from "@/lib/models/httpResponse";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";

// GET /api/admin/users
// NB: henter hele brukerlisten flatt — søk/filter/sortering/paginering gjøres client-side i
// app/admin/users/page.tsx. Server-side paginering er bevisst ikke innført ennå — vurder det
// når brukerlisten faktisk blir stor nok til å trenge det.
export const GET = async () => {
  try {
    const data = await agentAuthAdmin.getUsers();

    const response: HttpResponse<AdminUserListItem[]> = {
      statusCode: 200,
      message: "Brukerliste hentet med hell.",
      body: data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage = error instanceof Error ? error.message : "Kunne ikke hente brukerliste.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status });
  }
};

// PUT /api/admin/users
export const PUT = async (request: Request) => {
  try {
    const body = await request.json();
    const result = await agentAuthAdmin.updateUser(body);

    const response: HttpResponse<undefined> = {
      statusCode: 200,
      message: result.message || "Brukerinformasjonen ble oppdatert.",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;
    const errorMessage =
      error instanceof Error ? error.message : "Oppdatering av bruker mislyktes.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status });
  }
};
