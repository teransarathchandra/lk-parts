# TODOS

## Security

- **Admin auth middleware**
  **Priority:** P0
  **What:** `/admin` routes and `/api/admin/*` are currently passthrough. Must add Supabase JWT verification (`customer.is_admin = true`) before production.
  **File:** `middleware.ts:9`

## Payments / Inventory

- **Supabase RPC functions**
  **Priority:** P0
  **What:** `reserve_inventory`, `release_inventory`, `confirm_inventory`, `search_products` RPCs must be created in the Supabase DB. InventoryService and SearchService call these but they don't exist yet — checkout will fail in production.
  **Files:** `lib/services/InventoryService.ts`, `lib/services/SearchService.ts`

- **Delivery fee model**
  **Priority:** P1
  **What:** Delivery fee is hardcoded to LKR 350 via `DELIVERY_FEE_LKR` env var. No per-district or weight-based logic yet.
  **File:** `lib/services/OrderService.ts:24`

## Products / Catalog

- **CSV import**
  **Priority:** P1
  **What:** No admin UI or API for bulk product import. Spec and import endpoint needed.

## Auth

- **OTP verification (Phase 2)**
  **Priority:** P1
  **What:** Phone OTP in checkout is simulated (advances automatically). Wire up `supabase.auth.verifyOtp` for real SMS verification before going live.
  **File:** `components/checkout/CheckoutFlow.tsx:45`

## Cart / Orders

- **Validate cart item quantities**
  **Priority:** P1
  **What:** `POST /api/cart/items` accepts any `quantity` value without validation. Zero or negative quantities create invalid cart rows and corrupt order totals/inventory reservations.
  **File:** `app/api/cart/items/route.ts:17`

- **Webhook idempotency ordering**
  **Priority:** P1
  **What:** Koko webhook `completed` path confirms inventory and updates order BEFORE inserting the idempotent event record. A concurrent retry will see the dedupe check pass and run the inventory mutation again. Insert idempotency record first, then mutate.
  **File:** `app/api/webhooks/koko/route.ts:53`

- **Search fallback PostgREST filter injection**
  **Priority:** P0
  **What:** `SearchService.searchFallback` interpolates raw query string into Supabase `.or()` filter. Crafted input with commas/operators can alter filter logic (PostgREST filter injection — not SQL injection, but leaks/manipulates data).
  **File:** `lib/services/SearchService.ts` (searchFallback method)

- **Cart cookie missing Secure flag**
  **Priority:** P1
  **What:** Session token cookie in cart endpoints is set without the `Secure` flag. Transmitted in plaintext over HTTP.
  **File:** `app/api/cart/items/route.ts:32`

- **No rate limiting on OTP / order creation**
  **Priority:** P1
  **What:** OTP step is simulated (any 6-digit input accepted). `POST /api/orders` has no rate limiting — unlimited fraudulent COD orders possible. Add rate limiting before going live.

- **Search limit not clamped**
  **Priority:** P1
  **What:** `GET /api/search?limit=` accepts arbitrary values with no max. Pass `limit=100000` to force full table scan.
  **File:** `app/api/search/route.ts:8`

- **Webhook maps unknown Koko statuses to 'failed'**
  **Priority:** P1
  **What:** New Koko status strings (pending, disputed, etc.) default to the failed path — triggering inventory release and order failure on legitimate payments. Add explicit allowlist.
  **File:** `app/api/webhooks/koko/route.ts`

- **Phone last-4 brute-force on order lookup/cancel**
  **Priority:** P0
  **What:** `GET /api/orders/[id]` and `DELETE /api/orders/[id]/cancel` verify ownership via `phone_last4` — only 10,000 combinations. Anyone who knows (or guesses) an order UUID can brute-force the phone check. No rate limiting, no lockout. Add rate limiting before going live.
  **Files:** `app/api/orders/[id]/route.ts`, `app/api/orders/[id]/cancel/route.ts`

- **KOKO_SECRET missing causes silent webhook failure loop**
  **Priority:** P0
  **What:** If `KOKO_SECRET` is absent from env vars, `verifyWebhook` returns `false` and every real Koko webhook is rejected with 400. Orders stay stuck in `payment_initiated` with reserved inventory never confirmed or released. Add env var validation at startup.
  **File:** `lib/providers/KokoPaymentProvider.ts`

- **Delivery fee display/charge divergence**
  **Priority:** P0
  **What:** `CheckoutFlow.tsx` hardcodes `LKR 350` display value independently of the `DELIVERY_FEE_LKR` env var used server-side. Changing the env var produces a silent mismatch — customer sees one amount, gets charged another.
  **Files:** `components/checkout/CheckoutFlow.tsx`, `lib/services/OrderService.ts:24`

- **Webhook error handler returns 500 (causes infinite Koko retry loop)**
  **Priority:** P0
  **What:** The catch block returns `status: 500` but the intent (per comment) is to return 200 to prevent retries. Every error-path event triggers indefinite Koko retries, re-running inventory release on each attempt.
  **File:** `app/api/webhooks/koko/route.ts` (catch block)

- **Inventory double-release: concurrent cancel + failed webhook**
  **Priority:** P1
  **What:** Customer cancels a `payment_initiated` order while the Koko `failed` webhook arrives simultaneously. The cancel uses an atomic status guard, but the webhook handler calls `release` unconditionally after reading order state — no check whether the order was already cancelled. Results in `reserved_quantity` going negative (DB constraint fires, error is swallowed).
  **File:** `app/api/webhooks/koko/route.ts`

- **Admin inventory confirm race (double-confirm)**
  **Priority:** P1
  **What:** `PATCH /api/admin/orders/[id]/status` reads order status then calls `confirmReservation` without an atomic compare-and-swap. Two concurrent admin requests both read `cod_confirmed`, both confirm inventory — reserved quantity goes double-negative.
  **File:** `app/api/admin/orders/[id]/status/route.ts`

- **Cart addItem TOCTOU — concurrent adds lose increments**
  **Priority:** P1
  **What:** `CartService.addItem` reads existing quantity then writes `existing.quantity + 1` in two separate DB calls with no transaction. Two concurrent add-to-cart requests for the same product both read the same quantity and one increment is silently lost.
  **File:** `lib/services/CartService.ts`

- **InventoryService.updateStock ignores reserved_quantity**
  **Priority:** P1
  **What:** Admin inventory update sets the `quantity` column directly without accounting for reserved units. Setting quantity below current `reserved_quantity` fires a DB constraint error. Admin UI shows no reserved count. Setting quantity just above reserved creates phantom available stock.
  **File:** `lib/services/InventoryService.ts`, `app/api/admin/inventory/[productId]/route.ts`

- **returnUrl contains literal {ORDER_ID} placeholder (Koko redirect bug)**
  **Priority:** P1
  **What:** `POST /api/orders` passes `returnUrl: \`${appUrl}/orders/\$\{'{ORDER_ID}'}\`` — the literal string `{ORDER_ID}` is sent to Koko. If `NEXT_PUBLIC_APP_URL` env var is missing, Koko's post-payment redirect lands on a broken URL with the placeholder unexpanded.
  **File:** `app/api/orders/route.ts:54`

- **Webhook idempotency only guards 'completed', not 'failed'**
  **Priority:** P1
  **What:** The idempotency check on duplicate webhooks only deduplicates `completed` events. A duplicate `failed` webhook passes the check and calls `release` a second time — inventory goes negative, DB constraint fires, error is swallowed, Koko retries again.
  **File:** `app/api/webhooks/koko/route.ts`

- **CartService.cleanupExpired leaks reserved inventory**
  **Priority:** P1
  **What:** Expired cart cleanup bulk-deletes carts and cart_items without checking for associated orders in `payment_initiated`. If a Koko redirect is in flight when the cart expires, the cleanup orphans the reservation with no release.
  **File:** `lib/services/CartService.ts` (cleanupExpired method)

- **supabaseAdmin missing server-only guard**
  **Priority:** P1
  **What:** `lib/supabase.ts` exports `supabaseAdmin` (service role key) without a `server-only` import guard. A misconfigured barrel export could accidentally bundle the service key into client-side code.
  **File:** `lib/supabase.ts`

- **OrderService.updateStatus allows any status transition**
  **Priority:** P1
  **What:** Admin `PATCH` can move a cancelled or delivered order to any status (e.g., `shipped`). No valid state transition guard exists — any status can be applied to any order.
  **File:** `lib/services/OrderService.ts` (updateStatus method)

## Completed
