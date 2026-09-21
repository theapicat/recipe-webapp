"use client";

import { HttpResponse } from "@/lib/models/httpResponse";

// Svaret fra denne appens egne route handlers (app/api/**), som alltid følger HttpResponse<T>-konvolutten.
// Ellers en vanlig Response — `ok`/`status` er uendret, kun `json()` er typet.
export interface ApiResponse<T = undefined> extends Response {
  json(): Promise<HttpResponse<T>>;
}

// Delt på tvers av alle kall i denne fanen, slik at flere samtidige 401-er trigger ett enkelt
// fornyelsesforsøk i stedet for ett per kall (som i verste fall kunne ugyldiggjort hverandres nye token).
let refreshPromise: Promise<boolean> | null = null;

const refreshToken = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      mode: "same-origin",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Gjør selve kallet. Hvis det feiler med 401 (utløpt/ugyldig token), prøver den å fornye tokenet
// via /api/auth/refresh og gjentar kallet én gang. Lykkes ikke fornyelsen, returneres det
// opprinnelige 401-svaret uendret slik at kallende kode kan vise sin vanlige feilmelding.
const requestWithRetry = async (url: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(url, init);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshToken();
  if (!refreshed) {
    return response;
  }

  return fetch(url, init);
};

const send = <T>(url: string, method: string, body?: object) =>
  requestWithRetry(url, {
    method,
    mode: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as Promise<ApiResponse<T>>;

// Typeparameteren T er typen på `body` i HttpResponse<T> — f.eks. agentInternal.get<AdminUserListItem[]>(...).
export const agentInternal = {
  get: <T = undefined>(url: string) => send<T>(url, "GET"),
  post: <T = undefined>(url: string, body: object) => send<T>(url, "POST", body),
  put: <T = undefined>(url: string, body: object) => send<T>(url, "PUT", body),
  delete: <T = undefined>(url: string, body?: object) => send<T>(url, "DELETE", body),
};
