# lk-parts

Fitment-aware auto parts e-commerce for Sri Lanka. Find parts that fit your exact vehicle, buy with COD or Koko BNPL, track your order in real time.

**Version:** 0.2.0.0 | **Status:** Phase 1 complete

---

## What it does

- **Vehicle-first catalog** — select Type → Brand → Model → Variant, see only parts that fit
- **Fitment tagging** — exact fit (guaranteed), compatible, or universal; fitment snapshot stored on every order item
- **Cart** — session-token based (48h TTL), live badge updates, vehicle assignment
- **Checkout** — phone OTP (simulated Phase 1), address, order review, payment selection
- **Payments** — Cash on Delivery + Koko BNPL with HMAC webhook verification
- **Orders** — atomic inventory reservation, status tracking, cancellation
- **Admin panel** — order list + status management, inventory adjustment

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, React 19) |
| Database | Supabase (PostgreSQL + RLS + RPC) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Payments | COD + Koko BNPL |
| Tests | Vitest + @testing-library/react (133 tests) |
| Language | TypeScript |

---

## Getting started

```bash
bun install
```

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KOKO_API_KEY=
KOKO_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_PHONE=94XXXXXXXXX
DELIVERY_FEE_LKR=350
```

Run migrations in `supabase/migrations/` (001–003), then:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/                  Pages + API routes (Next.js App Router)
  api/                REST endpoints (cart, orders, search, admin, webhooks)
  admin/              Admin UI
components/
  catalog/            ProductCard, SearchResults, VehicleSelector, AddToCartButton
  checkout/           CartClient, CheckoutFlow, CheckoutSteps, OrderStatusClient
  ui/                 FitmentBadge, StockBadge, Navbar, Footer, TrustStrip, OrderStatusStepper
lib/
  services/           CartService, CatalogService, InventoryService, OrderService, SearchService
  providers/          KokoPaymentProvider, CodPaymentProvider
supabase/migrations/  DB schema (001 full schema, 002 part number norm, 003 idempotency constraint)
__tests__/            133 Vitest tests — services + 13 UI components
```

---

## Running tests

```bash
bun test              # run all tests
bun test --coverage   # with coverage report
```

---

## Key design decisions

**Fitment model:** every product has `fitment_type` (exact | compatible | universal). Exact-fit products require a vehicle in the cart. On order creation, a `fitment_snapshot` JSON blob is stored on the order item — vehicle info at purchase time, immutable.

**Inventory:** atomic reservation via Supabase RPC (`reserve_inventory`). If any item in the cart is out of stock, the whole reservation rolls back before the order is created.

**Cart:** cookie-based session token (`lkp_cart`), no login required for Phase 1. The `cart:updated` custom DOM event keeps the navbar badge in sync across add/remove actions without a global state library.

**Order cancellation:** atomic `UPDATE ... WHERE status IN (cancellable_statuses)` prevents double-cancel + double inventory release under concurrent requests.

---

## Docs

- [`DESIGN.md`](./DESIGN.md) — visual design spec, color tokens, component wireframes
- [`CHANGELOG.md`](./CHANGELOG.md) — version history
- [`TODOS.md`](./TODOS.md) — open items (P0 security TODOs before production)

---

## Before going to production

Several P0 items must be resolved — see [`TODOS.md`](./TODOS.md). The two most important:

1. **Admin auth middleware** (`middleware.ts`) — admin routes are currently passthrough
2. **Supabase RPC functions** — `reserve_inventory`, `release_inventory`, `confirm_inventory`, `search_products` must be created in the DB
