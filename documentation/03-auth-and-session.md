# 03 – Auth & Sesjon

Dette er det mest kompliserte hjørnet av kodebasen, og der de fleste "hvorfor logges jeg ut?"-symptomene
oppstår. Les hele dette dokumentet før du gjør endringer i login/proxy/session-flyten.

## 1. Sesjonsmodellen: tre cookies

All sesjonstilstand ligger i tre cookies, satt/lest utelukkende gjennom `lib/session/sessionManager.ts`.
**Ingen annen kode skal lese/skrive disse cookiene direkte** — gå alltid via `sessionManager`.

| Cookie         | Innhold                                       | `httpOnly` | Levetid                                         |
| -------------- | --------------------------------------------- | ---------- | ----------------------------------------------- |
| `token`        | JWT access-token (OpenIddict)                 | Ja         | `expires_in` fra token-response (default 3600s) |
| `refreshToken` | OAuth2 refresh-token                          | Ja         | 14 dager                                        |
| `user_data`    | JSON av `UserProfileResponse` — lesbar for UI | Nei        | 14 dager                                        |

`sessionManager` eksponerer også to ren-JWT-hjelpere som dekoder base64-payloaden manuelt (ingen
JWT-bibliotek er i bruk):

- `getRemainingExpTime(token)` — sekunder til utløp, eller `-1` ved parse-feil/manglende `exp`.
- `getUserRole(token)` — leser `role`, `roles`, eller
  `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`-claimet.

## 2. To HTTP-klienter — ikke bland dem

| Klient                       | Kjører i                | Brukes til                                                          | Auth-header                                                                          |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `lib/agent/agentInternal.ts` | Klient (`"use client"`) | Kalle **denne appens egne** `app/api/**`-ruter, same-origin `fetch` | Ingen — cookien følger automatisk med                                                |
| `lib/agent/agentExternal.ts` | Server (route handlers) | Kalle **Gatewayen** direkte, `mode: "cors"`                         | `Authorization: Bearer <token fra sessionManager.getToken()>`, satt manuelt per kall |

`agentAuth.ts` og `agentAuthAdmin.ts` er tynne, typede wrappere rundt `agentExternal` — én metode per
Gateway-endepunkt (login, register, hent profil, lås bruker, svarteliste, ...).

**Viktig:** `agentExternal` gjør **ingen** forsøk på å fornye et utløpt token før den bruker det. Den henter
bare det som ligger i cookien akkurat nå og sender det av gårde. All fornyelse er `proxy.ts` sitt ansvar
(se under) — og `proxy.ts` dekker ikke disse kallene.

## 3. `proxy.ts` — Next.js' "Proxy" (tidligere Middleware)

> Denne Next.js-versjonen har omdøpt `middleware.ts` til `proxy.ts`. Filen ligger i repo-roten og har samme
> jobb som `middleware.ts` hadde i eldre Next.js-prosjekter.

Matcher: `/dashboard/:path*`, `/user/:path*`, `/admin/:path*` — kjører altså kun ved navigasjon til disse
sidene, ikke ved API-kall (se punkt 5).

Logikk, i rekkefølge:

1. **Ingen tokens i det hele tatt** (verken `token` eller `refreshToken`) → redirect til `/login`.
2. **Trenger fornyelse?** Hvis `token` mangler, eller har mindre enn 300 sekunder igjen til utløp
   (`getRemainingExpTime`), og det finnes en `refreshToken` → kall
   `POST {GATEWAY_URL}/auth/connect/token` med `grant_type=refresh_token` direkte (uten å gå via
   `agentAuth`/`agentExternal` — dette er en frittstående `fetch`).
   - Lykkes det → nye tokens brukes resten av requesten, og settes på responsen som `Set-Cookie`.
   - Feiler det (f.eks. `invalid_grant` fordi refresh-tokenet er utløpt) → tvungen utlogging: cookies
     slettes, redirect til `/login?expired=true`.
3. **Token mangler og ingen refreshToken** → samme tvungne utlogging.
4. **Muterer request-headers** slik at Server Components i samme request-syklus ser det ferske tokenet med
   en gang (`NextResponse.next({ request: { headers } })`).
5. **Admin-gating:** for `/admin/*` dekodes rollen fra det (eventuelt nylig fornyede) tokenet. Er den ikke
   `admin` → redirect til `/404`.

### Miljøvariabel: én kilde til sannhet

Refresh-kallet i `proxy.ts` bruker:

```ts
const refreshUrl = `${process.env.GATEWAY_URL || "http://localhost:5000/api"}/auth/connect/token`;
```

— samme `GATEWAY_URL` som `agentAuth.ts`/`agentAuthAdmin.ts` bygger sin base-URL fra
(`` `${GATEWAY_URL}/auth` ``). Dette var tidligere to separate variabler (`AUTH_API`/`CORE_API`) pluss en
tredje, aldri satt variabel i `proxy.ts` alene (`NEXT_PUBLIC_AUTH_API`), som gjorde at proxyens token-refresh
kjørte på en hardkodet fallback-URL uten at noen la merke til det. Slått sammen til én variabel nettopp for at
dette ikke skal kunne skje igjen — endres Gateway-URL-en, er det ett sted å gjøre det.

## 4. Innloggingsflyter

### 4.1 E-post/passord

```
LoginForm (client) → agentInternal.post("/api/auth/login")
  → app/api/auth/login/route.ts
      → agentAuth.login()         (OAuth2 "password" grant → Gateway /connect/token)
      → fetch GET {GATEWAY_URL}/auth/account/me   (henter profil med det ferske access-tokenet)
      → sessionManager.setSession(tokens, profil)   (setter alle tre cookies)
  ← { statusCode, body: UserProfileResponse }
→ session.setUser(...) i SessionProvider, redirect til /dashboard eller /admin/dashboard
```

### 4.2 Google OAuth (avviker fra alt annet — leser IKKE via agentAuth)

```
GoogleLogin/GoogleRegister → window.location.href = "/api/auth/google"
  → app/api/auth/google/route.ts: redirect til {GATEWAY_URL}/auth/account/external-login?provider=Google
    (fullstendig browser-redirect, forlater Next.js)
  → [Gateway/Google OAuth-dans skjer utenfor denne appen]
  → Gateway redirecter tilbake til /api/auth/google-callback?access_token=...&refresh_token=...&user_id=...&email=...&...
    → app/api/auth/google-callback/route.ts bygger UserProfileResponse manuelt av query-parameterne
      og kaller sessionManager.setSession() + setter cookies eksplisitt på responsen
  → redirect til /user/welcome (førstegangsbruker) eller /dashboard
```

Feilkoder fra Gateway (`?error=account_locked|blacklisted|access_denied|google_failed|oauth_failed`) fanges
opp og oversettes til norske feilmeldinger i `app/(auth)/login/page.tsx` og `app/(auth)/register/page.tsx`.

### 4.3 Utlogging

`UserMenu.tsx` → `agentInternal.post("/api/auth/logout")` → `app/api/auth/logout/route.ts` kaller kun
`sessionManager.removeSession()` (ingen kall mot Gateway for å invalidere token/refresh-token server-side).

## 5. Hva `proxy.ts` _ikke_ dekker — rotårsaken til de fleste sesjonsproblemer

Matcher-en inkluderer ikke `/api/:path*`. Det betyr at **enhver** klient-side `agentInternal`-kall som treffer
en route handler under `app/api/auth/**` eller `app/api/admin/**` (f.eks. `refreshProfile()`, lagring av
profil, admin-handlinger) **aldri** trigger token-fornyelsen i `proxy.ts`. Flyten der er i stedet:

```
Klientkomponent → agentInternal → route handler → agentExternal (leser rått token fra cookie, IKKE fornyet)
  → Gateway svarer 401 hvis tokenet er utløpt
  → agentAuth-metoden ser !response.ok → throw new Error(...)
  → route handler sin catch-blokk → returnerer generisk { statusCode: 400, message: "..." }
```

Konsekvens: hvis en bruker blir stående på f.eks. `/user/mealplan` (client component) uten å navigere til en
ny matched rute, og access-tokenet utløper mens de fortsatt har en gyldig refresh-token, vil ethvert
`agentInternal`-kall bare feile med en 400 — **ikke** automatisk fornyelse, **ikke** tvungen redirect til
`/login`. Brukeren opplever at "ting slutter å virke" uten forklaring, i stedet for enten (a) sømløs fornyelse
eller (b) en tydelig "du er logget ut"-tilstand.

To ting i koden underbygger at dette var _tiltenkt_ løst, men aldri fullført:

- **`agentAuth.refresh()` finnes** (bygger `grant_type=refresh_token`-kallet mot Gateway), men den **kalles
  aldri** fra noe sted i kodebasen (verken fra `agentInternal`, en interceptor, eller enkeltsider).
- **`SessionProvider.refreshProfile()`** finnes for å hente fersk profil, men brukes kun i
  `app/confirm-email/page.tsx` — ikke som en periodisk sjekk, ikke ved mount av `MainShell`, og ikke som del
  av noen 401-håndtering.

Det finnes med andre ord **ingen 401-interceptor** noe sted i `agentInternal`/`agentExternal`.

**Mulige retninger for en fix** (til diskusjon, ikke implementert):

1. Legg til en sentral feilhåndtering i `agentInternal` som fanger 401 fra route handlers, kaller et
   `/api/auth/refresh`-endepunkt (nytt) som bruker `agentAuth.refresh()`, og replayer det opprinnelige kallet.
2. Utvid `proxy.ts`-matcher til å inkludere `/api/auth/:path*` og `/api/admin/:path*`, slik at samme
   refresh-før-du-treffer-handleren-logikk gjelder for API-kall også (enklere, men kjører på hvert eneste
   API-kall, ikke bare sidenavigasjon).

## 6. Rolle-sjekk — hold øye med konsistens

Rollestrengen fra JWT-et sammenlignes forskjellig ulike steder:

- `proxy.ts`, `login/page.tsx`, `register/page.tsx`, `LoginForm.tsx`: `role?.toLowerCase() === "admin"`.
- `Header.tsx`: `session.role === "Admin"` (eksakt, case-sensitiv).

Fungerer i dag fordi backend konsekvent sender `"Admin"`/`"User"` med stor forbokstav, men er skjørt — se
[07 – Kjente problemer](./07-known-issues-and-tech-debt.md#inkonsistent-rollesjekk-i-header).
