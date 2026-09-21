# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Kjøkkenhylla ("the kitchen shelf") — a Norwegian-language personal recipe manager, weekly meal planner, shopping-list
generator, and nutrition tracker. UI copy, validation messages, and code comments are in Norwegian (Bokmål) — match
that when adding user-facing strings.

This app (`recipe-webapp`) is only the frontend + server-side proxy layer of a larger system:

- **`recipe-webapp`** (this repo) — Next.js 16 App Router frontend.
- **Recipe Gateway API** (YARP, `http://localhost:5000`) — validates the JWT, strips/injects headers (e.g.
  `X-User-Id`), then routes to backend services: `recipe-authentication-api` (port 5001) and `recipe-core-api`
  (port 5002).
- **Scraping microservice** — handles recipe import from approved external sites, invoked via the gateway.

Full technical documentation (architecture, routing, auth deep-dive, API integration, admin panel, forms/design
system, known issues, backlog) lives in numbered files under [`documentation/`](./documentation) — read the relevant one
before making non-trivial changes in that area; it goes into far more depth than this file.

Known backend gaps this repo compensates for on the frontend (e.g. the gateway may not implement
`POST /connect/revoke` yet) are described where they occur — see `documentation/03-auth-and-session.md`, section 4.3.

**Private notes — never stage or commit:** `frontend-notes.md` (Core's contract for us) and `backend-notes.md` (our detailed asks of Core) are local-only
working memos, not documentation. When staging, use explicit paths (never `git add -A`/`.` from the repo root without excluding them).
The public summary of the backend dependencies is `documentation/10-backlog.md`, section 7 (ids B1–B15, same in both).

## Commands

- `npm run dev` — start the dev server.
- `npm run build` / `npm run start` — production build / run.
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`'s core-web-vitals +
  typescript configs).
- No test runner is configured in this repo (no test script, no Jest/Vitest config). Before finishing a change run
  `npx tsc --noEmit`, `npm run lint` and `npx prettier --check <changed files>` (`res.json()` is loosely typed, so
  also read both sides of a handler ⇄ component interface — `tsc` won't catch every mismatch).
- `next dev` injects a "nextjs-agent-rules" block into this file on every start; it is not part of our docs (disable
  with `agentRules: false` in `next.config.ts` if it bothers you).

### Environment variables (`.env.local`)

- `GATEWAY_URL` — base URL of the Recipe Gateway API (e.g. `http://localhost:5000/api`). Auth endpoints are
  `${GATEWAY_URL}/auth/*` (used by `lib/agent/agentExternal.ts`, `proxy.ts`, and the Google OAuth
  routes); everything else (e.g. the public contact form) hits `${GATEWAY_URL}/*` directly. One variable for both,
  by design (used to be two out-of-sync variables — see `documentation/03-auth-and-session.md`).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id (client-visible). Currently unused in the frontend code
  (the actual client secret/id exchange happens gateway-side) — not necessarily dead, just unverified in this repo.

## Architecture

### Auth & session flow

- Sessions are three cookies managed exclusively through `lib/session/sessionManager.ts`: `token` (httpOnly access
  token), `refreshToken` (httpOnly), `user_data` (readable JSON profile, for client UI). All cookie reads/writes
  should go through this module rather than touching `next/headers` cookies directly.
- `proxy.ts` at the repo root is this Next.js version's renamed `middleware.ts` (see the vendored Next docs in
  `node_modules/next/dist/docs/`). It matches `/dashboard/:path*`, `/user/:path*`, `/admin/:path*`, and on every matched request:
  refreshes the access token when it's missing or <300s from expiry, force-logs-out (clears cookies, redirects to
  `/login?expired=true`) if the refresh fails, and for `/admin/*` decodes the JWT's role claim and redirects to
  `/404` if the role isn't `admin`.
- **Exactly two HTTP agents, not interchangeable — do not add per-domain agent/wrapper files:**
  - `lib/agent/agentInternal.ts` — `"use client"`, same-origin `fetch` used by client components to call this app's
    own `app/api/**/route.ts` handlers. Generic: `agentInternal.post<UserProfileResponse>(...)` types `res.json()` as
    `HttpResponse<UserProfileResponse>`. Catches 401 responses, calls `POST /api/auth/refresh` (deduped across
    concurrent calls via a module-level promise) and retries the original request once before giving up.
  - `lib/agent/agentExternal.ts` — server-only (reads the httpOnly token cookie), the single place that talks to the
    gateway. Takes a path relative to `GATEWAY_URL` (`agentExternal.get<T>("/auth/account/me")`), attaches
    `Authorization: Bearer <token>` from `sessionManager`, parses the body and returns it as `T` (`undefined` for an
    empty/204 body). On failure it throws `ApiError` (`lib/agent/ApiError.ts`, carries the real HTTP status) with the
    message extracted from whichever error format the backend used (Core `ProblemDetails.detail`, Auth API
    `message`, OpenIddict `error_description`); unreachable gateway/timeout become 503/504. It does not itself
    refresh an expired token.
- `app/api/**/route.ts` handlers are thin: they wrap their work in `apiRoute()` (`lib/http/apiRoute.ts`), which
  takes the Norwegian fallback error message and an action that calls `agentExternal` directly (plus `sessionManager`
  for cookies where needed), and always answers with the `HttpResponse<T>` envelope — the status mirrors
  `error.status` when the caught error is an `ApiError`, otherwise 400 with the fallback message. There is no
  per-endpoint wrapper layer between handler and `agentExternal` (the old `agentAuth`/`agentAuthAdmin` were removed).
  Exceptions that don't use the envelope: `/api/health` and the Google OAuth redirects.
- `app/api/auth/refresh/route.ts` is called only by `agentInternal` (never directly from a component): does the
  refresh-token grant via `agentExternal`, updates the `token`/`refreshToken` cookies via `sessionManager`, or clears
  the session and returns 401 if the refresh token itself is dead.
- Google OAuth is the one path that bypasses `agentExternal`: `app/api/auth/google` redirects to the gateway's
  `external-login`; `app/api/auth/google-callback` receives tokens + profile fields as query params directly from
  the gateway and calls `sessionManager.setSession` itself.
- JWT role/expiry are decoded manually in `sessionManager` (`getUserRole`, `getRemainingExpTime`) via base64 payload
  decoding — there is no JWT library dependency.
- `proxy.ts` still separately refreshes the token on page navigation to `/dashboard/*`, `/user/*`, `/admin/*` (see
  `documentation/03-auth-and-session.md`, section 3) — the two refresh paths (page nav vs. API call) are
  independent and both read `GATEWAY_URL`.
- Role is always normalized to lowercase (`UserRoleType = "admin" | "user"` in `lib/models/types.ts`, via the
  shared `normalizeRole()`) at every point a role enters app state — `sessionManager.setSession`/`setUserData`,
  `SessionProvider`'s constructor (`initialUser` seeding) as well as `setUser`/`updateUser`,
  `sessionManager.getUserRole`, and the Google OAuth callback. The backend always sends lowercase
  `admin`/`user` (JWT `role` claim, `/account/me`, Google callback param). Keep the normalization anyway —
  treat it as defense-in-depth (a stale cookie from before this normalization existed can still
  carry the old casing).
- Logout (`app/api/auth/logout/route.ts`) does a best-effort `POST /auth/connect/revoke` via `agentExternal` (errors
  swallowed) before clearing cookies. The gateway may not implement this endpoint yet, and revoking the refresh token
  does not invalidate an already-issued JWT access token before it expires — see
  `documentation/03-auth-and-session.md`, section 4.3.
- **Every fetch to the gateway is time-boxed.** `lib/agent/fetchWithTimeout.ts` (10s default, `AbortController`-based)
  wraps every `agentExternal` call and `proxy.ts`'s own inline refresh call — the only two places that reach
  out to `GATEWAY_URL`. Without this, an unreachable gateway (wrong host, dropped packets, VPN down — as opposed to
  "nothing listening on localhost", which fails fast) could hang a request indefinitely with no user feedback; this
  was an observed real bug in the logout flow. Keep using `fetchWithTimeout` for any new gateway-facing call rather
  than bare `fetch`.

### Route structure

`app/` uses route groups purely for organization/layout, not URLs: `(auth)`, `(info)`, `(legal)`, `(user)`. Auth
gating for `/user/*`, `/dashboard/*`, `/admin/*` happens in `proxy.ts`, not in per-page checks.

**No `<Suspense>` in pages.** Loading UI comes from the segment's `loading.tsx` (e.g. `app/admin/loading.tsx` covers every
admin page); data fetched inside a client component has its own loader. Avoid `useSearchParams` unless needed (it is what
forces a `<Suspense>` around a page) — e.g. keep tab state local.

### Form architecture (see `documentation/06-forms-and-design-system.md` for the full walkthrough)

Followed strictly in auth/admin; the recipe/mealplan/shoppinglist/import pages and the admin whitelist/
system pages are large monolithic client components with hardcoded mock data instead — see
`documentation/07-known-issues-and-tech-debt.md`.

Strict layering, page → container → form → field:

1. `page.tsx` stays minimal — wraps content in `MainContainer` or `AsyncMainContainer`
   (`components/containers/MainContainer.tsx`) for consistent width/padding/loading state, and does any server-side
   data fetching.
2. Feature form components (`components/forms/**/*Form.tsx`) are `"use client"`, own Mantine `useForm` state, and
   submit through `agentInternal` to this app's own route handlers.
3. `AppFormProvider`/`useAppFormContext` (`components/forms/common/FormContext.ts`, a Mantine `createFormContext`
   instance) shares form state down to fields without prop drilling.
4. `CreateFormContainer` vs `EditFormContainer` (`components/forms/common/`) are the shared chrome (title, error
   `Alert`, buttons, loading): create-mode submits immediately, edit-mode opens a confirmation modal first and adds
   an optional reset button.
5. `FormField` (`components/forms/common/FormField.tsx`) is the shared field wrapper bound to the form context.

### Design system (see `documentation/06-forms-and-design-system.md` for full palette/tokens)

- Mantine v9 theme (`theme.ts`) follows a 60-30-10 split with two custom 10-shade color tuples: `sage` (primary —
  brand/nav/primary actions) and `terracotta` (accent — CTAs, category badges, warnings), with different
  `primaryShade` per light/dark mode.
- Convention: category badges use `color="terracotta" variant="light"`; status/admin badges use `color="sage"
variant="filled"`; destructive actions use `red` or `terracotta`.
- **Global UI rules live in `app/globals.css`, once — never per component:** text is not selectable by default
  (`user-select: none`), plain text shows the default arrow cursor, and only interactive elements show `cursor: pointer`.
  Inputs stay selectable (Safari needs that to type). Opt in to selectable text with the `selectable` class, only where
  deliberately wanted. See `documentation/06`, section B.7.
- Accessibility is a hard requirement (deuteranopia/protanopia considered explicitly): never encode meaning in color
  alone — pair with icons (`@tabler/icons-react`) and text labels.

### Client session state

`SessionProvider` (`lib/session/SessionProvider.tsx`) is a React context seeded server-side in `app/layout.tsx` from
`sessionManager.getUserData()`, exposing `user`/`role` plus `refreshProfile()` (re-fetches `/api/auth/me` via
`agentInternal`) to client components via `useSession()`.

## Adding a backend-backed feature (the fixed recipe — follow it for every new endpoint)

Full version with code and pitfalls: `documentation/04-api-integration-and-data-models.md`, section 7.

1. **Models** in `lib/models/<domain>/`, one file per interface, filename == interface name; separate response and
   request models; copy the backend's wire format (`| null`, capitalized enum strings, no ids in requests).
2. **Route handler** `app/api/<path>/route.ts` (path mirrors the gateway path, e.g. gateway `/user/recipes` →
   `app/api/user/recipes/route.ts`), always `apiRoute("Norwegian fallback message", async (options) => ...)` +
   `agentExternal.<method><T>("/gateway/path", body, options)`. No raw `fetch`, no own try/catch, no new agent files.
   Route files may only export HTTP methods.
3. **Client**: `agentInternal.<method><T>("/api/<path>")` from a client component; show `message` on errors.
4. Update `documentation/02` (route list) and `documentation/07` (when a mock page gets wired up); deferred work goes in
   `documentation/10-backlog.md`.

Also, keep it generic where the backend is uniform (`documentation/04`, section 7.1):

- **Uniform resources share one dynamic route with a whitelist** — e.g. the six admin catalogs use
  `app/api/admin/[resource]` + `lib/models/catalog/CatalogResource.ts` (unknown name → 404, read-only → 405) instead of a
  file set per catalog. A resource that deviates from the contract gets its own static route (static wins over dynamic).
- **Don't create a request model identical to the response model** — use `Omit<T, "id">` for creates and `T` for updates.
  A separate request model only when the shape genuinely differs.
- **Drawer for big objects** (ingredients): list stays behind, tagged-union state, one `guard()` for unsaved changes; a dialog opened
  _by_ an Escape keypress needs `closeOnEscape={false}` (its own handler otherwise swallows the same keystroke) — `documentation/06`, B.9.
- **Official ingredients are partly locked** (`isOfficialIngredient` in `ingredientForm.ts`, derived from `sourceId` until the backend sends
  `isOfficial`, `documentation/10`, section 7, B2): name, energy, edible part, nutrient values and source stay identical to the public source;
  allergens, keywords, category, units, portions and verified stay editable; to change a locked value you create a variant (own, fully
  editable). Form actions (verified, cancel, save) live in a sticky bar at the top of the drawer form, never at the bottom.
- **Delete is blocked, not attempted:** show «Slett» disabled with a reason via `deleteBlockedReason()` (seeded `isSystem`, `usageCount > 0`,
  variants). `isSystem`/`usageCount` are optional model fields the backend doesn't send yet (`documentation/10`, section 7, B7). Verifying an
  ingredient requires nutrient values (`ingredientForm.ts`); unverifying is always allowed.
- **Long tables:** use `usePagedItems` + `TablePagination` (`components/common/`): pager above _and_ below, page size 25/50/100,
  and always change page through `goToPage` so the view jumps back to the top of the table (`documentation/06`, B.8).
- **Header nav:** a link set with more than 5 links collapses to the burger menu below `lg` (1200px) instead of `md`
  (see `Header.tsx`, `collapseBelow`) — otherwise the user menu is clipped at the right edge. Admin has 6 links.
- **Read-only catalog resources** (`READ_ONLY_CATALOG_RESOURCES`, today `unit-types`) can be read as data but have no tab
  and reject writes with 405.
- **Forms:** `FormField` supports `text | password | email | textarea | select | number` (norwegian decimal comma); both form
  containers have a `bare` mode for use inside a `Modal`. Add missing field types to `FormField`, not ad hoc in a form.
