# 02 – Ruting & Sider

## 1. App Router og route groups

Alle sider ligger under `app/`. Mappenavn i parenteser er **route groups** — de påvirker layout/organisering,
men vises aldri i URL-en:

| Route group      | Formål                                                                              | Eksempel-URL                                         |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `(auth)`         | Innlogging, registrering, gjenoppretting                                            | `/login`, `/register`, `/recover`, `/reset-password` |
| `(info)`         | Offentlig informasjon                                                               | `/about`, `/contact`, `/faq`, `/features`, `/status` |
| `(legal)`        | Juridiske dokumenter, med egen sidemeny-layout                                      | `/legal`, `/legal/terms`, `/legal/privacy`, ...      |
| `(user)`         | Alt bak innlogging for vanlige brukere                                              | `/dashboard`, `/user/recipes`, `/user/mealplan`, ... |
| — (ingen gruppe) | `app/confirm-email`, `app/page.tsx` (forside), `app/error.tsx`, `app/not-found.tsx` | `/confirm-email`, `/`                                |
| `app/admin/`     | Adminpanelet (egen top-level-mappe, ikke en route group)                            | `/admin/dashboard`, `/admin/users`, ...              |

`(user)/user` har i tillegg en nøstet gruppe `(account)` for `/user/profile` og `/user/settings` — samme
mønster, bare ett nivå dypere.

## 2. Hvilke ruter er beskyttet, og hvordan

Tilgangskontroll skjer **ikke** i den enkelte `page.tsx`, men sentralt i `proxy.ts` (root av repoet). Se
[03 – Auth & sesjon](./03-auth-and-session.md) for full gjennomgang av selve token-logikken. Kort oppsummert:

```ts
export const config = {
  matcher: ["/dashboard/:path*", "/user/:path*", "/admin/:path*"],
};
```

- Alt annet (forsiden, `(auth)`, `(info)`, `(legal)`, `/confirm-email`) er offentlig og krever ingen token.
- `/admin/*` krever i tillegg at JWT-ets rolle-claim er `admin` — ellers redirectes brukeren til `/404`.
- **Merk:** matcher'en dekker ikke `/api/:path*`. Route handlers under `app/api/**` er _ikke_ beskyttet av
  proxyen — de stoler på at cookien inneholder et gyldig token når `agentExternal` kaller Gatewayen, og
  Gatewayen selv avviser ugyldige/utløpte tokens. Dette har praktiske konsekvenser for sesjonshåndtering,
  se [03](./03-auth-and-session.md#5-token-fornyelse-for-api-kall-agentinternal--apiauthrefresh).

## 3. Sidenes ansvar (konvensjon)

`page.tsx`-filer skal være tynne — de setter rammen (`MainContainer`/`AsyncMainContainer`, se
[06](./06-forms-and-design-system.md)) og eventuelt henter data server-side. All interaktiv logikk hører
hjemme i klientkomponenter under `components/`. Dette følges strengt for auth- og admin-sidene, men **ikke**
for kjernedomene-sidene (oppskrifter/måltidsplan/handleliste) — se avviket dokumentert i
[07 – Kjente problemer](./07-known-issues-and-tech-debt.md#store-monolittiske-sider-uten-backend).

## 4. Spesialfiler

| Fil                            | Rolle                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`               | Root layout. Setter opp `MantineProvider`, `Notifications`, `SessionProvider` (seedet server-side fra `sessionManager.getUserData()`) og `MainShell` (header/footer). |
| `app/error.tsx`                | Global error boundary (client component, Next.js-konvensjon). Viser feilmelding + "Prøv igjen"/"Tilbake".                                                             |
| `app/not-found.tsx`            | Global 404-side. Brukes bl.a. når `proxy.ts` avviser en ikke-admin fra `/admin/*`.                                                                                    |
| `app/(legal)/legal/layout.tsx` | Egen to-kolonne-layout (sidemeny + innhold) kun for `/legal/*`-rutene.                                                                                                |
| `app/confirm-email/page.tsx`   | Ligger bevisst **utenfor** `(auth)`-gruppen siden lenken kommer fra e-post og ikke skal ha samme layout-kontekst som innloggingssidene.                               |

## 5. Navigasjonslenker

`components/layout/header/navlinks.ts` definerer tre lenkesett — `GUEST_LINKS`, `USER_LINKS`, `ADMIN_LINKS`
— som `Header.tsx` velger mellom basert på `session.role`. Rollen er alltid normalisert til `"admin"`/`"user"`
(små bokstaver) før den havner i sesjonstilstanden, så `Header.tsx` sammenligner med små bokstaver — se
[03 – Auth & sesjon, seksjon 6](./03-auth-and-session.md#6-rolle-normalisert-til-små-bokstaver-ved-kilden).

## 6. API-ruter (`app/api/**/route.ts`)

Route handlers er ikke sider, men de følger samme mappestruktur og er dokumentert separat i
[04 – API-integrasjon & datamodeller](./04-api-integration-and-data-models.md) (inkludert malen for nye endepunkter).
Alle svarer med `HttpResponse<T>`-konvolutten via `apiRoute`, unntatt `/api/health` og Google-rutene (redirect).
Fullstendig liste, med backend-endepunktet hver rute kaller (relativt til `GATEWAY_URL`):

```
/api/health                              GET   – enkel healthcheck (status, service, env, timestamp)
/api/public/contact                      POST  → /public/contact-form (Core)

/api/auth/login                          POST  → /auth/connect/token (password grant) + /auth/account/me
/api/auth/register                       POST  → /auth/account/register + /auth/connect/token
/api/auth/logout                         POST  → /auth/connect/revoke (best-effort)
/api/auth/refresh                        POST  → /auth/connect/token (refresh grant), brukt internt av agentInternal.ts
/api/auth/me                             GET   → /auth/account/me
/api/auth/google                         GET   – redirect til Gateway sin external-login
/api/auth/google-callback                GET   – mottar tokens/profil som query-params fra Gateway
/api/auth/updateProfile                  PUT   → /auth/account/profile
/api/auth/change-password                POST  → /auth/account/change-password
/api/auth/set-password                   POST  → /auth/account/set-password
/api/auth/deleteProfile                  DELETE → /auth/account/me
/api/auth/confirm-email                  POST  → /auth/account/confirm-email
/api/auth/resend-confirmation            POST  → /auth/account/resend-confirmation
/api/auth/recover                        POST  → /auth/account/recover
/api/auth/reset-password                 POST  → /auth/account/reset-password
/api/auth/complete-welcome               GET   → /auth/account/complete-welcome

/api/admin/users                         GET, PUT  → /auth/admin/users
/api/admin/users/[id]                    GET   → /auth/admin/users/{id}
/api/admin/users/lock                    POST  → /auth/admin/users/lock
/api/admin/users/unlock                  POST  → /auth/admin/users/unlock
/api/admin/users/confirm-email           POST  → /auth/admin/users/confirm-email
/api/admin/users/resend-confirmation     POST  → /auth/admin/users/resend-confirmation
/api/admin/users/reset-password-request  POST  → /auth/admin/users/reset-password-request
/api/admin/users/send-email              POST  → /auth/admin/send-email
/api/admin/users/delete                  POST  → /auth/admin/users/delete
/api/admin/users/delete-and-blacklist    POST  → /auth/admin/users/delete-and-blacklist
/api/admin/users/blacklist               GET, POST → /auth/admin/blacklist
/api/admin/users/blacklist/[id]          DELETE → /auth/admin/blacklist/{id}
```

Endepunktene i `recipe-core-api` (kataloger, ingredienser, oppskrifter, næring) har ingen ruter her ennå — de
bygges i rekkefølgen beskrevet i [08](./08-model-and-component-structure-proposal.md), etter malen i 04, seksjon 7.
