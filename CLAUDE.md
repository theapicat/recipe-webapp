# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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
system, known issues) lives in numbered files under [`documentation/`](./documentation) — read the relevant one
before making non-trivial changes in that area; it goes into far more depth than this file.

## Commands

- `npm run dev` — start the dev server.
- `npm run build` / `npm run start` — production build / run.
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`'s core-web-vitals +
  typescript configs).
- No test runner is configured in this repo (no test script, no Jest/Vitest config).

### Environment variables (`.env.local`)

- `AUTH_API` — base URL of the gateway's auth surface (e.g. `http://localhost:5000/api/auth`), used server-side by
  `lib/agent/agentAuth.ts` and `lib/agent/agentAuthAdmin.ts`.
- `CORE_API` — base URL for recipe/core data (e.g. `http://localhost:5000/api`).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id (client-visible).

## Architecture

### Auth & session flow

- Sessions are three cookies managed exclusively through `lib/session/sessionManager.ts`: `token` (httpOnly access
  token), `refreshToken` (httpOnly), `user_data` (readable JSON profile, for client UI). All cookie reads/writes
  should go through this module rather than touching `next/headers` cookies directly.
- `proxy.ts` at the repo root is this Next.js version's renamed `middleware.ts` (see "Proxy" in the vendored Next
  docs / `AGENTS.md`). It matches `/dashboard/:path*`, `/user/:path*`, `/admin/:path*`, and on every matched request:
  refreshes the access token when it's missing or <300s from expiry, force-logs-out (clears cookies, redirects to
  `/login?expired=true`) if the refresh fails, and for `/admin/*` decodes the JWT's role claim and redirects to
  `/404` if the role isn't `admin`.
- Two HTTP client wrappers, not interchangeable:
  - `lib/agent/agentInternal.ts` — `"use client"`, same-origin `fetch` used by client components to call this app's
    own `app/api/**/route.ts` handlers.
  - `lib/agent/agentExternal.ts` — server-side `fetch` (CORS) that attaches `Authorization: Bearer <token>` from
    `sessionManager`, used to call the external gateway directly.
- `lib/agent/agentAuth.ts` and `lib/agent/agentAuthAdmin.ts` wrap `agentExternal` into typed, per-endpoint methods
  (login, register, profile, admin user management, blacklist, etc.) against `AUTH_API`.
- `app/api/**/route.ts` handlers are a thin proxy layer: parse the client request, call `agentAuth`/`agentAuthAdmin`,
  then translate the result into session cookies (via `sessionManager`) and a JSON response.
- Google OAuth is the one path that bypasses `agentAuth`: `app/api/auth/google` redirects to the gateway's
  `external-login`; `app/api/auth/google-callback` receives tokens + profile fields as query params directly from
  the gateway and calls `sessionManager.setSession` itself.
- JWT role/expiry are decoded manually in `sessionManager` (`getUserRole`, `getRemainingExpTime`) via base64 payload
  decoding — there is no JWT library dependency.
- **Known gap (see `documentation/03-auth-and-session.md`):** `proxy.ts`'s token-refresh only runs for page
  navigations matching its matcher — it does not cover `/api/*`, so a client-side `agentInternal` call made after
  the access token has expired just fails with a generic 400 instead of refreshing or forcing logout.
  `agentAuth.refresh()` exists but is called from nowhere. Also, `proxy.ts` reads `NEXT_PUBLIC_AUTH_API` for its
  refresh call while everything else uses `AUTH_API` — `NEXT_PUBLIC_AUTH_API` isn't set, so it silently runs on a
  hardcoded fallback URL. Don't "fix" either without discussing the approach — see the doc for options.

### Route structure

`app/` uses route groups purely for organization/layout, not URLs: `(auth)`, `(info)`, `(legal)`, `(user)`. Auth
gating for `/user/*`, `/dashboard/*`, `/admin/*` happens in `proxy.ts`, not in per-page checks.

### Form architecture (see `documentation/06-forms-and-design-system.md` for the full walkthrough)

Followed strictly in auth/admin; the recipe/mealplan/shoppinglist/import pages and the admin whitelist/categories/
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
- Accessibility is a hard requirement (deuteranopia/protanopia considered explicitly): never encode meaning in color
  alone — pair with icons (`@tabler/icons-react`) and text labels.

### Client session state

`SessionProvider` (`lib/session/SessionProvider.tsx`) is a React context seeded server-side in `app/layout.tsx` from
`sessionManager.getUserData()`, exposing `user`/`role` plus `refreshProfile()` (re-fetches `/api/auth/me` via
`agentInternal`) to client components via `useSession()`.
