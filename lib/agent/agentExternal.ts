import sessionManager from "@/lib/session/sessionManager";
import { fetchWithTimeout } from "@/lib/agent/fetchWithTimeout";
import { ApiError } from "@/lib/agent/ApiError";

const GATEWAY_URL = process.env.GATEWAY_URL;

if (!GATEWAY_URL) {
  throw new Error("Miljøvariabelen GATEWAY_URL er ikke definert.");
}

export interface ExternalRequestOptions {
  // Norsk feilmelding som brukes når Gatewayen ikke oppgir noen brukbar melding selv.
  errorMessage?: string;
  // Eksplisitt access token. Kun for kall rett etter innlogging, før token-cookien er satt.
  token?: string;
}

const DEFAULT_ERROR_MESSAGE = "Noe gikk galt. Prøv igjen senere.";

// Tom eller ikke-JSON body (f.eks. 204, eller Core sitt kontaktskjema som svarer med ren tekst) gir undefined.
const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

// Backendene bruker forskjellige feilformater:
//   Core API (ProblemDetails):  { title, status, detail }   — kun `title` på database-409 og `errors` ved
//                                                             bindingsfeil (ikke presenterbart -> fallback)
//   Auth API:                   { message }
//   OpenIddict (/connect/*):    { error, error_description }
const extractMessage = (body: unknown, status: number): string | undefined => {
  if (typeof body !== "object" || body === null) return undefined;

  const error = body as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

  return (
    text(error.detail) ??
    text(error.message) ??
    text(error.error_description) ??
    text(error.error) ??
    (status === 409 ? text(error.title) : undefined)
  );
};

// Eneste sted som snakker med Gatewayen. `path` er relativ til GATEWAY_URL (f.eks. "/auth/account/me").
// Returnerer den parsede JSON-bodyen som T (undefined ved tom body), og kaster ApiError med Gatewayens
// faktiske statuskode ved feil — se lib/http/apiRoute.ts for hvordan route handlers bruker det.
const send = async <T>(
  method: string,
  path: string,
  request: { body?: string; contentType: string },
  options: ExternalRequestOptions = {},
): Promise<T> => {
  const token = options.token ?? (await sessionManager.getToken());

  let response: Response;
  try {
    response = await fetchWithTimeout(`${GATEWAY_URL}${path}`, {
      method,
      mode: "cors",
      headers: {
        "Content-Type": request.contentType,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: request.body,
    });
  } catch (error: unknown) {
    // Uoppnåelig Gateway (nettverksfeil) eller timeout fra fetchWithTimeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Tjenesten svarte ikke i tide. Prøv igjen senere.", 504);
    }
    throw new ApiError("Kunne ikke nå serveren. Prøv igjen senere.", 503);
  }

  const data = await readBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractMessage(data, response.status) ?? options.errorMessage ?? DEFAULT_ERROR_MESSAGE,
      response.status,
    );
  }

  return data as T;
};

const JSON_TYPE = "application/json";

export const agentExternal = {
  get: <T>(path: string, options?: ExternalRequestOptions) =>
    send<T>("GET", path, { contentType: JSON_TYPE }, options),

  post: <T>(path: string, body: object, options?: ExternalRequestOptions) =>
    send<T>("POST", path, { contentType: JSON_TYPE, body: JSON.stringify(body) }, options),

  put: <T>(path: string, body: object, options?: ExternalRequestOptions) =>
    send<T>("PUT", path, { contentType: JSON_TYPE, body: JSON.stringify(body) }, options),

  delete: <T>(path: string, body?: object, options?: ExternalRequestOptions) =>
    send<T>(
      "DELETE",
      path,
      { contentType: JSON_TYPE, body: body ? JSON.stringify(body) : undefined },
      options,
    ),

  // application/x-www-form-urlencoded — kreves av OAuth2-endepunktene (/connect/*) og /account/register.
  postForm: <T>(path: string, body: URLSearchParams, options?: ExternalRequestOptions) =>
    send<T>(
      "POST",
      path,
      { contentType: "application/x-www-form-urlencoded", body: body.toString() },
      options,
    ),
};
