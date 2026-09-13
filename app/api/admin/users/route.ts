import { NextResponse } from "next/server";
import { agentAuthAdmin } from "@/lib/agent/agentAuthAdmin";
import { HttpResponse } from "@/lib/models/httpResponse";
import {AdminUserQueryParams} from "@/lib/models/admin/users/AdminUserQueryParams";
import {AdminUserListItem} from "@/lib/models/admin/users/AdminUserListItem";
import {PaginatedResponse} from "@/lib/models/paginatedResponse";


// GET /api/admin/users
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);

    const params: AdminUserQueryParams = {
      search: searchParams.get("search") || undefined,
      statusFilter:
        (searchParams.get("statusFilter") as AdminUserQueryParams["statusFilter"]) ||
        undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!, 10)
        : undefined,
      pageSize: searchParams.get("pageSize")
        ? parseInt(searchParams.get("pageSize")!, 10)
        : undefined,
    };

    const data = await agentAuthAdmin.getUsers(params);

    const response: HttpResponse<PaginatedResponse<AdminUserListItem>> = {
      statusCode: 200,
      message: "Brukerliste hentet med hell.",
      body: data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke hente brukerliste.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
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
    const errorMessage =
      error instanceof Error ? error.message : "Oppdatering av bruker mislyktes.";

    const errorResponse: HttpResponse<undefined> = {
      statusCode: 400,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
};