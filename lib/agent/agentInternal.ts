"use client";

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

export const agentInternal = {
  get: async (url: string) => {
    return await requestWithRetry(url, {
      method: "GET",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
  },
  post: async (url: string, body: object) => {
    return await requestWithRetry(url, {
      method: "POST",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
  put: async (url: string, body: object) => {
    return await requestWithRetry(url, {
      method: "PUT",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
  delete: async (url: string, body?: object) => {
    return await requestWithRetry(url, {
      method: "DELETE",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};
