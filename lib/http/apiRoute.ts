import { NextResponse } from "next/server";
import { ApiError } from "@/lib/agent/ApiError";
import type { ExternalRequestOptions } from "@/lib/agent/agentExternal";
import { HttpResponse } from "@/lib/models/httpResponse";

export interface RouteResult<T> {
  message: string;
  body?: T;
  status?: number;
}

// Felles ramme for alle route handlers under app/api/** som svarer klientkomponentene.
//
//   export const POST = (request: Request) =>
//     apiRoute<Recipe>("Kunne ikke opprette oppskriften.", async (options) => {
//       const recipe = await agentExternal.post<Recipe>("/user/recipes", await request.json(), options);
//       return { message: "Oppskriften ble opprettet.", body: recipe, status: 201 };
//     });
//
//   - `errorMessage` er den norske reservemeldingen. Den sendes til action som `options`, slik at
//     agentExternal bruker den når Gatewayen ikke oppgir en brukbar melding, og brukes her for alle
//     andre feil (f.eks. ugyldig JSON i requesten) — aldri en rå feiltekst til brukeren.
//   - suksess blir til HttpResponse<T> med meldingen/bodyen action returnerer
//   - ApiError (fra agentExternal, eller kastet bevisst i action) propagerer sin egen melding og statuskode
export const apiRoute = async <T = undefined>(
  errorMessage: string,
  action: (options: ExternalRequestOptions) => Promise<RouteResult<T>>,
): Promise<NextResponse<HttpResponse<T>>> => {
  try {
    const { message, body, status = 200 } = await action({ errorMessage });

    const response: HttpResponse<T> = {
      statusCode: status,
      message,
      body,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status });
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 400;

    const response: HttpResponse<T> = {
      statusCode: status,
      message: error instanceof ApiError ? error.message : errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status });
  }
};
