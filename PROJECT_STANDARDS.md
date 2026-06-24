# SmartCart — Project Standards & Context

This document describes how this **Next.js 16** frontend is organised: folders, styling, APIs, state, and i18n. It aligns AI and human contributors with existing practices.

---

## Tech stack

| Area | Technology |
|------|------------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS v4** (via `@tailwindcss/postcss`) |
| Styling source of truth | **SCSS theme** (`src/styles/`) + utility classes — not raw Tailwind palette names for colours/fonts |
| Global state | **Redux Toolkit** (`@reduxjs/toolkit`) + `react-redux` |
| i18n | Locale dictionaries (`en`, `hi`) via `app/[lang]/dictionaries/` |
| HTTP | **Axios** via `src/services/httpClient.ts` |
| Forms / validation | **react-hook-form** + **Zod** (via `@hookform/resolvers/zod`) |
| Icons | **lucide-react** |
| Auth tokens | **js-cookie** (stored as `auth_token` cookie, 7-day expiry) |

---

## Top-level folder structure

```
smart-cart/
├── app/                     # Next.js App Router: routes, layouts, page shells
│   └── [lang]/              # Locale segment (en | hi)
│       ├── (auth)/          # Auth flows — no Navbar
│       ├── (public)/        # Public pages (home)
│       ├── (protected)/     # Authenticated pages (dashboard)
│       └── dictionaries/    # Locale loader (server-only)
├── middleware.ts            # Locale redirect + auth guard
├── src/
│   ├── components/          # Shared UI (layout, common primitives, ui kit)
│   ├── features/            # Domain features colocated by domain
│   ├── locale/              # i18n JSON dictionaries (en.json, hi.json)
│   ├── services/            # API layer: httpClient + per-domain services
│   ├── store/               # Redux store, slices, typed hooks
│   ├── styles/              # Global SCSS + theme tokens
│   └── types/               # Cross-cutting TypeScript types
└── PROJECT_STANDARDS.md
```

### `app/[lang]/` — routing

- **Locale segment**: all user-facing routes live under `app/[lang]/`.
- **Route groups** (parentheses = no URL segment):
  - `(auth)/` — login, register, forgot-password, reset-password. Layout has **no Navbar**.
  - `(public)/` — home and other public pages.
  - `(protected)/` — authenticated pages. Middleware redirects to `/[lang]/login` when `auth_token` cookie is missing.
- **Pattern**: `page.tsx` = server entry; interactive UI in a `*Client.tsx` with `"use client"`.
- **Params are async**: always `await params` in server components (`params: Promise<{ lang: string }>`).

### `features/` — feature modules

- One folder per domain: `home/`, `auth/`, etc.
- Typical contents: **components**, **utils**, **types**, **hooks** scoped to that feature.
- Prefer **colocating** feature-specific code here instead of bloating `components/`.

### `components/`

- **`components/ui/`** — design-system building blocks (Button, Input, Card, Modal).
- **`components/common/`** — shared widgets (Navbar, Footer, ReduxProvider).

### `services/`

- **`httpClient.ts`** — Axios instance. Reads `auth_token` cookie for Bearer header. Transforms errors into plain `Error` objects. Never treat `ERR_CANCELED` as a failure.
- **`auth.service.ts`** — login, register, forgotPassword, resetPassword, logout. All hit `/api/v1/auth/*`.
- One service file per backend domain. Never call `fetch`/`axios` directly in components.

### `store/`

- **`store.ts`** — `configureStore`, registers reducers.
- **`slices/authSlice.ts`** — RTK async thunks for auth; persists token in `js-cookie`.
- **`hooks.ts`** — typed `useAppDispatch` / `useAppSelector`.

### `locale/`

- **`en.json`** — source of truth for all UI strings.
- **`hi.json`** — Hindi translations with identical key structure.
- Loaded server-side in `app/[lang]/dictionaries/index.ts` and passed as `dict` prop.
- **Never hard-code UI strings in components** — always add keys to both locale files.

---

## Styling architecture

### Load order (`src/styles/main.scss`)

1. `themes/_light` — `[data-theme="light"] { CSS variables }`
2. `themes/_dark` — `[data-theme="dark"] { CSS variables }`
3. `themes/_typography` — font-size / font-weight utility classes
4. Utility + component classes (buttons, inputs, cards, navbar, …)

`body` uses **`var(--color-bg-primary)`** and **`var(--color-text-primary)`**.

### Theme tokens

Defined in `src/styles/themes/_light.scss` and `_dark.scss`.

| Variable | Purpose |
|----------|---------|
| `--color-bg-primary` | Page background |
| `--color-bg-secondary` | Subtle section background |
| `--color-bg-card` | Card / input surface |
| `--color-bg-card-hover` | Card hover state |
| `--color-text-primary` | Main body text |
| `--color-text-secondary` | Supporting text |
| `--color-text-muted` | Placeholders, labels |
| `--color-accent-primary` | Brand accent (indigo) |
| `--color-accent-hover` | Accent hover |
| `--color-border` | Default border |
| `--color-border-accent` | Focused / accent border |
| `--color-shadow-accent` | Accent glow shadow |

**Utility classes from `main.scss`:**

| Concept | Class |
|---------|-------|
| Page background | `bg-primary` |
| Subtle background | `bg-secondary` |
| Main text | `text-primary` |
| Supporting text | `text-secondary` |
| Muted / placeholder | `text-muted` |
| Accent colour | `text-accent` |
| Card + glass effect | `card-glass` |
| Standard card | `card` |

### Tailwind-first rule

**Use Tailwind utilities by default.** Only reach for a custom SCSS class when Tailwind cannot express the intent — which is almost exclusively when a CSS custom property (theme variable) is involved.

| Need | Use |
|------|-----|
| Spacing, sizing, flex/grid, overflow, rounding | **Tailwind** (`p-4 flex gap-2 rounded-xl`) |
| Static colours that never change with theme | **Tailwind** (`text-white bg-red-500`) |
| Theme-aware colour or border that must follow `data-theme` | **SCSS class** (`text-primary`, `bg-primary`, `card-glass`) |
| Typography scale | **SCSS class** (`text-h3`, `fs-sm`, `fw-semibold`) |
| Complex animations / pseudo-elements | **SCSS class** |
| Inline `style={{}}` | **Never** — move to an SCSS class |

**Avoid:**
- Raw Tailwind palette colours where the value must change with the theme: `slate-*`, `gray-*`, `indigo-*`
- `dark:*` Tailwind variants — theme already switches via `data-theme` attribute
- Creating a new SCSS class for something Tailwind handles (spacing, layout, static sizing)
- Adding CSS custom properties in SCSS for values that don't vary between themes

**Goal:** keep `main.scss` for theme-aware utilities and complex component classes only. Every new piece of UI should start with Tailwind and only add an SCSS class if a CSS variable is required.

### Typography (`src/styles/themes/_typography.scss`)

Use named classes for all font sizing and weighting — never raw `text-sm` / `font-bold`.

**Font size:**

| Class | Size | Use |
|-------|------|-----|
| `fs-xs` | 11 px | Badges, overlines |
| `fs-sm` | 13 px | Captions, helper text |
| `fs-base` | 14 px | Default body / inputs |
| `fs-md` | 15 px | Body copy |
| `fs-lg` | 16 px | Emphasized body |
| `fs-xl` | 18 px | Small headings |
| `fs-2xl` | 20 px | Subheadings |
| `fs-3xl` | 24 px | Section labels |
| `fs-4xl` | 28 px | Page headings |
| `fs-5xl` | 32 px | Hero subheadings |
| `fs-display` | clamp 2.4–4 rem | Hero / display headings |

**Font weight:**

| Class | Weight |
|-------|--------|
| `fw-normal` | 400 |
| `fw-medium` | 500 |
| `fw-semibold` | 600 |
| `fw-bold` | 700 |
| `fw-extrabold` | 800 |

**Heading composites** (size + weight + line-height pre-combined):

| Class | Use |
|-------|-----|
| `text-h1` | Hero headings |
| `text-h2` | Section headings |
| `text-h3` | Card/modal headings |
| `text-h4` | Sub-section headings |
| `text-h5` | Labels, nav items |
| `text-body-lg` | Emphasized body |
| `text-body` | Default body |
| `text-body-sm` | Supporting text |
| `text-caption` | Small descriptions |
| `text-label` | Form labels, tags |
| `text-overline` | Eyebrow text |

Pair with colour utilities: `className="text-h3 text-primary"`, `className="text-body-sm text-secondary"`.

### Buttons (`main.scss`)

| Class | Description |
|-------|-------------|
| `btn` | Base — required on every button |
| `btn-primary` | Filled accent button |
| `btn-outline` | Bordered accent button |
| `btn-ghost` | Transparent button |
| `btn-sm` | Small size modifier |
| `btn-lg` | Large size modifier |

### Inputs (`main.scss`)

- Use the `Input` component from `src/components/ui/Input` — it applies `.input-base` and exposes `label`, `error`, `leftIcon`, `rightIcon`.

---

## Authentication

### Flow

| Page | Route | Description |
|------|-------|-------------|
| Login | `/[lang]/login` | Email + password → sets `auth_token` cookie |
| Register | `/[lang]/register` | Name + email + password → sets `auth_token` cookie |
| Forgot password | `/[lang]/forgot-password` | Email → backend sends reset link |
| Reset password | `/[lang]/reset-password?token=…` | New password → clears old token |

### State (`src/store/slices/authSlice.ts`)

```ts
{
  user: User | null
  token: string | null   // synced from js-cookie on load
  isLoading: boolean
  error: string | null
  forgotPasswordSuccess: boolean
  resetPasswordSuccess: boolean
}
```

Exported thunks: `loginThunk`, `registerThunk`, `forgotPasswordThunk`, `resetPasswordThunk`, `logoutThunk`.

### Middleware (`middleware.ts`)

- Handles locale redirect (missing `[lang]` prefix → redirect to detected locale).
- Protects `/[lang]/dashboard` and any path under it: reads `auth_token` cookie; redirects to `/[lang]/login?redirect=…` if absent.

---

## Backend API (base: `NEXT_PUBLIC_API_URL`)

All auth endpoints are under `/api/v1/auth/`:

| Method | Path | Payload | Response |
|--------|------|---------|---------|
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ user, accessToken }` |
| POST | `/api/v1/auth/register` | `{ name, email, password }` | `{ user, accessToken }` |
| POST | `/api/v1/auth/forgot-password` | `{ email }` | `{ message }` |
| POST | `/api/v1/auth/reset-password` | `{ token, newPassword }` | `{ message }` |
| POST | `/api/v1/auth/logout` | — | — |

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to the backend server.

---

## i18n

- **Locales**: `en`, `hi` — see `app/[lang]/dictionaries/index.ts`.
- **Provider**: dictionaries loaded in `[lang]/layout.tsx` (server-side) and passed as `dict` prop to components.
- **Strings**: Add keys to **both** `src/locale/en.json` and `src/locale/hi.json`. English is the source of truth.
- Auth strings live under `dict.auth.{login,register,forgot_password,reset_password}`.

---

## Data flow (typical)

1. **Server page** receives `dict` from `getDictionary(lang)` and passes it to a **client form component**.
2. **Client form** uses `react-hook-form` + `zod` for validation.
3. On submit → **`dispatch`** (RTK thunk) → **service** → **`httpClient`** → backend.
4. **`fulfilled`** handler updates Redux state; error lands in `state.error`.
5. UI reads state via `useAppSelector`.

---

## Conventions checklist (for new UI)

1. **Colours / surfaces**: use `text-primary`, `text-secondary`, `text-accent`, `bg-primary`, `card-glass`, `text-muted` — not raw hex or Tailwind palette names.
2. **Typography**: use `text-h*`, `text-body*`, `text-label`, `fs-*`, `fw-*` — not `text-sm` / `font-bold`.
3. **Strings**: add keys in both locale files (`src/locale/en.json`, `src/locale/hi.json`).
4. **Forms**: `react-hook-form` + `zod`; use `Input` component for all fields.
5. **API calls**: extend `src/services/*.service.ts`; never `fetch`/`axios` directly in components.
6. **Global state**: prefer RTK thunks for shared async data; local `useState` for strictly local UI.
7. **Params**: in server components always `await params` (`params: Promise<{ lang: string }>`).
8. **Auth**: read `token` from Redux; dispatch `loginThunk` / `logoutThunk`.

---

## Related files to read first

| Topic | Location |
|-------|----------|
| CSS variables (light) | `src/styles/themes/_light.scss` |
| CSS variables (dark) | `src/styles/themes/_dark.scss` |
| Typography scale | `src/styles/themes/_typography.scss` |
| Utility classes | `src/styles/main.scss` |
| Store | `src/store/store.ts` |
| Auth slice | `src/store/slices/authSlice.ts` |
| HTTP client | `src/services/httpClient.ts` |
| Auth service | `src/services/auth.service.ts` |
| i18n dictionaries | `app/[lang]/dictionaries/index.ts` |
| English locale | `src/locale/en.json` |

---

*Last updated: 2026-06-23 — reflects SmartCart frontend structure and practices.*
