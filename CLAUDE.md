# VeloTrax Frontend — CLAUDE.md

> Lead Architect & AI Coding Rules for the Next.js frontend that communicates with `velotrax-gateway-go`.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| API Layer | tRPC (cross-language via JSON-over-HTTP transport) |
| Auth | NextAuth.js (or custom JWT cookies) |
| State | React Server Components first; Zustand for client state only when necessary |
| Validation | Zod (shared schema definitions) |

---

## 2. Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (public)/
│   │   ├── page.tsx            # Home page
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (protected)/
│   │   └── dashboard/
│   │       ├── layout.tsx      # Auth guard layout
│   │       └── page.tsx
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts  # tRPC HTTP handler (proxy to Go gateway)
│   │   └── auth/[...nextauth]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                     # Atomic, reusable UI primitives (Button, Input, Card…)
│   ├── auth/                   # SignInForm, SignUpForm, SignOutButton
│   └── dashboard/              # Feature-specific dashboard widgets
├── server/
│   ├── trpc/
│   │   ├── client.ts           # tRPC client factory
│   │   ├── router.ts           # Next.js-side tRPC router (thin proxy)
│   │   └── procedures/         # One file per domain (auth, user, telemetry…)
│   └── actions/                # Next.js Server Actions (form submissions, mutations)
├── lib/
│   ├── auth.ts                 # Session helpers
│   ├── utils.ts                # cn(), formatters, etc.
│   └── validators/             # Zod schemas shared across client + server
├── types/
│   └── index.ts                # Global TypeScript types
└── middleware.ts               # Route protection middleware
```

---

## 3. Page Inventory

### 3.1 Home Page `/`
- Public, statically rendered.
- Marketing copy, CTA buttons linking to `/sign-in` and `/sign-up`.
- No authenticated data fetched here.

### 3.2 Auth Pages
| Route | Purpose |
|---|---|
| `/sign-in` | Email + password sign-in form. Calls `auth.signIn` tRPC procedure. |
| `/sign-up` | Registration form with validation. Calls `auth.register` tRPC procedure. |
| `/sign-out` | Server Action that clears the session cookie and redirects to `/`. |

- All auth forms are **client components** (`"use client"`) with controlled inputs.
- Validation is client-side via Zod before submission.
- Errors from the Go gateway are surfaced inline via tRPC error codes.

### 3.3 Dashboard `/dashboard` (Protected)
- Wrapped in an auth-guard layout (`dashboard/layout.tsx`).
- Fetches data via tRPC in React Server Components (no waterfall).
- Modular widget components; each widget fetches its own slice of data.

---

## 4. Authentication & Route Protection

```ts
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/sign-in" },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- Session token is a **JWT stored in an HttpOnly cookie**.
- The token is forwarded as a `Bearer` header in every tRPC call to the Go gateway.
- `middleware.ts` blocks all `/dashboard/*` routes for unauthenticated users.

---

## 5. Networking — tRPC + Go Gateway (Critical)

### 5.1 Architecture

```
Browser / RSC
     │
     ▼ tRPC call
Next.js API route  (/api/trpc/[trpc])
     │  (adds Auth header, validates session)
     ▼ HTTP POST  (JSON)
velotrax-gateway-go  (:8080/trpc)
     │  (Golang tRPC-compatible handler)
     ▼
Business logic / DB
```

The Go backend exposes a **tRPC-compatible JSON-over-HTTP endpoint**. No code generation from Go is required on the Next.js side; the contract is enforced through shared Zod schemas.

### 5.2 Cross-Language Binding Strategy

Because tRPC's native code generation targets TypeScript servers, the following approach bridges Go:

1. **Source of truth: OpenAPI / Protobuf spec in the Go repo.**
   - `velotrax-gateway-go` MUST maintain an OpenAPI 3.x spec (or `.proto` files).
   - The spec is the single authoritative contract.

2. **TypeScript type generation.**
   - Run `openapi-typescript` (or `protoc-gen-ts`) against the Go spec to auto-generate TypeScript interfaces into `src/types/gateway.generated.ts`.
   - Script: `pnpm generate:types` → `openapi-typescript ./specs/gateway.yaml -o src/types/gateway.generated.ts`
   - Commit generated types; regenerate whenever the Go spec changes.

3. **tRPC thin-proxy router.**
   - The Next.js tRPC router does NOT contain business logic.
   - Each procedure validates input with Zod, forwards the request to the Go gateway via `fetch`, and returns the typed response.
   - Example:
     ```ts
     // server/trpc/procedures/auth.ts
     export const authRouter = router({
       signIn: publicProcedure
         .input(signInSchema)          // Zod schema
         .mutation(async ({ input }) => {
           const res = await gatewayFetch("/auth/sign-in", input);
           return res as SignInResponse; // generated type
         }),
     });
     ```

4. **Runtime validation.**
   - All responses from the Go gateway are parsed with Zod before being returned to the client. This catches contract drift early.

5. **Type-sync CI check.**
   - Add a CI step that regenerates types and fails if the diff is non-empty, enforcing that generated types are always in sync with the Go spec.

### 5.3 Gateway Fetch Helper

```ts
// lib/gateway.ts
const GATEWAY_BASE = process.env.GATEWAY_URL ?? "http://localhost:8080";

export async function gatewayFetch<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${GATEWAY_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: await res.text() });
  return res.json() as T;
}
```

---

## 6. Server Actions

Use Next.js Server Actions for **form mutations** (not data fetching):

```ts
// server/actions/auth.ts
"use server";

export async function signOutAction() {
  await clearSession();           // invalidate JWT cookie
  redirect("/");
}
```

Rules:
- Server Actions MUST be in `server/actions/` and marked `"use server"`.
- Never expose raw DB calls in Server Actions — always go through the tRPC/gateway layer.
- Prefer Server Actions over client-side API calls for mutations triggered by `<form>`.

---

## 7. AI Coding Rules

### 7.1 TypeScript
- `strict: true` is non-negotiable. No `any`. Use `unknown` + type guards.
- All props, function parameters, and return types must be explicitly typed.
- Prefer `type` over `interface` for object shapes unless extending is required.
- Use generated gateway types from `src/types/gateway.generated.ts`; do not hand-write duplicate types.

### 7.2 Component Rules
- Default to **React Server Components**. Add `"use client"` only when hooks or browser APIs are needed.
- Components live in `components/`. One component per file; filename = component name.
- Props types are defined in the same file as the component, directly above it.
- No inline styles. Tailwind classes only. Use `cn()` from `lib/utils.ts` for conditional classes.
- Atomic UI primitives (`components/ui/`) must be dependency-free and fully reusable.

### 7.3 Data Fetching
- Fetch data in Server Components using the tRPC server client (`server/trpc/client.ts`).
- Do not `useEffect` for data fetching. Use SWR or React Query only if streaming/real-time is needed.
- Colocate data fetching with the page/layout that owns the data.

### 7.4 Naming Conventions
| Pattern | Convention |
|---|---|
| Files | `kebab-case.tsx` |
| Components | `PascalCase` |
| Functions / variables | `camelCase` |
| Zod schemas | `camelCase` + `Schema` suffix (e.g. `signInSchema`) |
| Types | `PascalCase` |
| Server Actions | `camelCase` + `Action` suffix (e.g. `signOutAction`) |
| tRPC Routers | `camelCase` + `Router` suffix (e.g. `authRouter`) |

### 7.5 Modular Structure Rules
- No component or utility file exceeds 200 lines. Extract if it does.
- No barrel `index.ts` files that re-export everything — import directly.
- Feature folders under `components/` group related components; no cross-feature imports.

### 7.6 Error Handling
- tRPC errors from the gateway map to user-facing messages in a central `lib/errors.ts`.
- Never `console.log` in production paths. Use a structured logger.
- Unhandled promise rejections in Server Components must be caught by `error.tsx` boundaries.

---

## 8. Environment Variables

```env
# .env.local
GATEWAY_URL=http://localhost:8080       # velotrax-gateway-go base URL
NEXTAUTH_SECRET=...                     # JWT signing secret
NEXTAUTH_URL=http://localhost:3000
```

All environment variables accessed in server code must be validated at startup with Zod:

```ts
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  GATEWAY_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## 9. Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint + TypeScript check
pnpm generate:types   # Regenerate gateway types from Go OpenAPI spec
pnpm test             # Vitest unit tests
```

---

## 10. Definition of Done (per feature)

- [ ] TypeScript compiles with zero errors (`tsc --noEmit`).
- [ ] No ESLint warnings.
- [ ] Generated types are in sync with the Go spec (`pnpm generate:types` produces no diff).
- [ ] Auth guard verified: unauthenticated access to `/dashboard/*` redirects to `/sign-in`.
- [ ] All tRPC procedure inputs validated with Zod schemas.
- [ ] No `any` types introduced.
- [ ] Component is a Server Component unless a `"use client"` directive is justified in a comment.

---

## 11. Phase 1: Prototype (✅ COMPLETED)

### 11.1 Scope
- [x] Project bootstrap (Next.js 14, TypeScript, Tailwind, tRPC, NextAuth)
- [x] Home page (`/`) with marketing CTAs
- [x] Auth system (sign-in, sign-up, sign-out) with NextAuth credentials provider
- [x] Dashboard layout (`/dashboard`) with session guard
- [x] Orders list page (`/dashboard`) with mock data and Suspense loading states
- [x] User profile page (`/dashboard/profile`) with async data fetching
- [x] Mock gateway layer (`src/lib/mock-gateway.ts`) for development without Go backend

### 11.2 Mock Gateway

The project includes a **mock gateway** enabled via `MOCK_GATEWAY=true` in `.env.local`. This allows full end-to-end testing without the actual Go backend.

**Mock Users:**
| Email | Password | Name |
|---|---|---|
| `demo@velotrax.io` | `password123` | Demo User |
| `admin@velotrax.io` | `password123` | Admin User |

**Mock Endpoints:**
- `POST /auth/sign-in` — validates email + password against hardcoded users
- `POST /auth/register` — creates new user with mock ID
- `GET /orders` — returns 8 mock orders
- `GET /user/profile` — returns user profile

**Implementation:**
- `src/lib/mock-gateway.ts` — mock handler function
- `src/lib/gateway.ts` — checks `MOCK_GATEWAY` env flag and dispatches to mock or real fetch
- Simulates 100ms network delay for realistic testing

### 11.3 Completed Components

**Pages:**
- `src/app/(public)/page.tsx` — Home page
- `src/app/(public)/sign-in/page.tsx` — Sign-in page
- `src/app/(public)/sign-up/page.tsx` — Sign-up page
- `src/app/(protected)/dashboard/page.tsx` — Orders dashboard with Suspense
- `src/app/(protected)/dashboard/profile/page.tsx` — User profile with Suspense

**Forms & Auth:**
- `src/components/auth/sign-in-form.tsx` — Client form with Zod validation
- `src/components/auth/sign-up-form.tsx` — Client form with password confirmation
- `src/components/auth/sign-out-button.tsx` — Logout button
- `src/server/actions/auth.ts` — Server Action for sign-out

**Dashboard Components:**
- `src/components/dashboard/orders-table.tsx` — Orders display with table layout
- `src/components/dashboard/orders-table-skeleton.tsx` — Loading skeleton
- `src/components/dashboard/user-profile-card.tsx` — Profile info card

**tRPC:**
- `src/server/trpc/router.ts` — Root router (auth, orders, user)
- `src/server/trpc/procedures/auth.ts` — Auth procedures (signIn, register)
- `src/server/trpc/procedures/orders.ts` — Orders procedures (list)
- `src/server/trpc/procedures/user.ts` — User procedures (profile)
- `src/server/trpc/client.ts` — Server-side tRPC caller

**Infrastructure:**
- `src/lib/auth.ts` — NextAuth config with credentials provider
- `src/lib/gateway.ts` — Gateway fetch helper with mock fallback
- `src/lib/mock-gateway.ts` — Mock gateway implementation
- `src/lib/errors.ts` — Error message mapping
- `src/lib/env.ts` — Environment validation with Zod
- `src/lib/validators/auth.ts` — Zod schemas for auth

### 11.4 Running Phase 1

```bash
pnpm install           # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
```

**Test Flow:**
1. Visit home page `/`
2. Sign in with `demo@velotrax.io` / `password123`
3. View mock orders on `/dashboard`
4. View user profile on `/dashboard/profile`
5. Sign out → redirects to home

---

## 12. Phase 2: Left Sidebar Layout (✅ COMPLETED)

### 12.1 Scope
- [x] Replace top-bar navigation with fixed left sidebar (w-64)
- [x] Reorganize navigation: Orders in sidebar nav, Profile + Sign Out in user section
- [x] Implement collapsible user section (toggle to show/hide Profile & Sign Out)
- [x] Layout: flex row with sidebar + scrollable main content
- [x] Active link highlighting on Orders link (`usePathname()`)
- [x] All Tailwind utilities (no external icon library)

### 12.2 New Components

**Sidebar Components:**
- `src/components/dashboard/sidebar.tsx` — Server Component, sidebar shell (logo + nav + user)
- `src/components/dashboard/sidebar-nav.tsx` — Client Component, navigation with active state
- `src/components/dashboard/sidebar-user.tsx` — Client Component, collapsible user section

**Modified:**
- `src/app/(protected)/dashboard/layout.tsx` — Replaced top-header with flex-row sidebar layout

### 12.3 Layout Structure

```
<div className="flex h-screen w-screen overflow-hidden bg-gray-50">
  <aside className="w-64 h-full flex-col border-r bg-white">
    [logo]
    [nav: Orders link with active state]
    [user section: avatar + email (toggle)]
      └─ [expanded: Profile link + Sign Out button]
  </aside>
  <main className="flex-1 overflow-y-auto">
    [dashboard content]
  </main>
</div>
```

### 12.4 User Section Toggle

- **Collapsed:** Shows avatar (initials) + user name/email
- **Expanded:** Shows Profile link and Sign Out button
- Click avatar to toggle expand/collapse
- Profile link auto-closes menu on click

### 12.5 Running Phase 2

```bash
pnpm dev              # Start dev server
```

**Test Flow:**
1. Sign in with `demo@velotrax.io` / `password123`
2. Sidebar appears on left with "VeloTrax" logo
3. Orders link in nav (click → active state blue highlight)
4. User section at bottom: avatar + "Demo User" + email
5. Click user section → expands to show Profile + Sign Out
6. Click Profile → navigates to `/dashboard/profile`, closes menu
7. Click Sign Out → redirects to `/`

---

## 13. Phase 3: Ready for Future Development

Once the Go backend (`velotrax-gateway-go`) is ready:

1. **Remove `MOCK_GATEWAY` env flag** from `.env.local`
2. **Generate types** from Go OpenAPI spec: `pnpm generate:types`
3. **Verify contract** — all mock responses should match generated types
4. **Switch to real gateway** — no code changes needed, just disable mock mode

The thin-proxy tRPC router and `gatewayFetch` helper are already designed to work seamlessly with the real backend.
