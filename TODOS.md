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

## Completed
