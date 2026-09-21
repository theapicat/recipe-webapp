/**
 * `fetch` med en tidsgrense. Uten dette kan et kall mot en uoppnåelig Gateway (feil vert, brannmur
 * som dropper pakker stille, VPN nede) henge på ubestemt tid, siden ingen av de vanlige feilene
 * (f.eks. ECONNREFUSED når ingenting kjører lokalt) inntreffer — se documentation/03-auth-and-session.md.
 *
 * Ved timeout kastes samme type feil (`AbortError`) som ved en vanlig nettverksfeil, så eksisterende
 * try/catch-blokker (best-effort revoke i `app/api/auth/logout`, tvungen utlogging i `proxy.ts`, osv.)
 * håndterer den uten videre endringer.
 */
export const fetchWithTimeout = async (
  url: string,
  init: RequestInit = {},
  timeoutMs: number = 10_000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};
