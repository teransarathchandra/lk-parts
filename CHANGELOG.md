# Changelog

All notable changes to lk-parts will be documented in this file.

## [0.1.0.1] - 2026-03-28

### Added
- **Footer component**: `Footer.tsx` with LK Parts branding, Returns Policy link, and conditional WhatsApp contact — added to all public pages (home, search, shop-by-vehicle, cart, orders, parts catalog + PDP)
- **TrustStrip component**: inline trust row (7-day return · Secure checkout · WhatsApp support) shown on PDP and cart page
- **CheckoutSteps component**: extracted reusable step progress indicator from `CheckoutFlow.tsx`; supports completed (✓), active, and upcoming states with `aria-current="step"`
- **OrderStatusStepper component**: 4-step visual stepper (Placed → Confirmed → Shipped → Delivered) mapped from order status enum; off-happy-path statuses (cancelled, payment_failed, etc.) gracefully degraded
- **Cart badge live updates**: `cart:updated` custom event wired — `AddToCartButton` dispatches on success, `CartClient.removeItem` dispatches after DELETE, `CartIcon` listens and refreshes count
- **Component test suite**: 86 tests total (up from 50) — new test files for `AddToCartButton`, `CartIcon`, `OrderStatusStepper`, `CheckoutSteps`, `StockBadge`, `TrustStrip`, `Footer`
- **Test infrastructure**: `vitest.setup.ts` + `setupFiles` config wiring for `@testing-library/jest-dom` matchers

### Changed
- **PDP actions**: replaced broken server-component `<button onClick={undefined}>` with `<AddToCartButton>` client component; WhatsApp button now solid green (`--whatsapp-green`) with `encodeURIComponent` on message text; actions stacked vertically at full width
- **PDP fitment section**: compatible badge now shows independently; exact-fit block shows vehicle warning ("Select your vehicle first...")
- **ProductCard**: fitment badge moved above price; `p-3` → `p-4`; product name gets `line-clamp-2`
- **Navbar**: removed `vehicleNickname` prop and garage indicator (descoped to Phase 2); logo gains accent dot; simplified to logo + search + cart
- **StockBadge**: In Stock state now renders as green pill (`bg-emerald-50`, `--stock-in-color`) instead of plain gray text
- **Cart skeleton loaders**: content-shaped skeletons (64px square + 3 lines) replacing single-block rectangles
- **CSS design tokens**: added `--accent-hover`, `--stock-in-color`, `--whatsapp-green` to `:root`; all `#aa1b00` hardcoded values replaced with `var(--accent-hover)`
- **WhatsApp links**: fixed broken `?? ''` fallback across `SearchResults.tsx`, PDP, and new components — all guarded with boolean check + `encodeURIComponent`
- **Filter chips**: added 14px SVG category icons; `scrollbar-none` on chip nav

### Fixed
- `CartIcon` badge was stale after add-to-cart and remove-from-cart actions — now refreshes via `cart:updated` event listener
- WhatsApp links generated broken `wa.me/` URLs when `NEXT_PUBLIC_SUPPORT_PHONE` was unset

## [0.1.0.0] - 2026-03-28

### Added
- **Fitment-aware product catalog**: vehicle cascade selector (make → model → variant), exact/compatible/universal fitment tagging, fitment snapshot stored on order items
- **Search**: full-text product search via Supabase RPC (`search_products`), fallback to ILIKE when RPC unavailable
- **Cart**: session-token cart with 48h TTL, per-item quantity management, vehicle assignment, auto-TTL extension on activity
- **3-step checkout**: phone OTP step (simulated Phase 1), address collection, order review + payment selection
- **COD payment**: Cash on Delivery flow — order created, `cod_confirmed` status, admin confirmation required
- **Koko BNPL payment**: Koko payment provider integration with HMAC webhook verification, idempotent event processing
- **Order management**: order creation with atomic inventory reservation, order status tracking, order cancellation
- **Inventory reservation**: Supabase RPC-based reserve/release/confirm cycle (`reserve_inventory`, `release_inventory`, `confirm_inventory`)
- **Admin panel**: order list + status management, inventory adjustment UI (protected by middleware — auth TODO before prod)
- **Notification stubs**: WhatsApp notification service (NotificationService) pre-wired for Phase 2
- **DB migrations**: 001 (full schema + seed data), 002 (part number normalization), 003 (payment_events idempotency unique constraint)
- **API routes**: `/api/vehicles`, `/api/products`, `/api/search`, `/api/cart`, `/api/orders`, `/api/orders/[id]`, `/api/orders/[id]/cancel`, `/api/admin/orders`, `/api/admin/inventory`, `/api/webhooks/koko`, `/api/internal/revalidate`
- **Test suite**: 50 unit tests (Vitest) covering SearchService, InventoryService, CartService, CatalogService, OrderService, KokoPaymentProvider, phone utils, slug utils

### Security
- Server-side phone_last4 ownership check on order GET and cancel endpoints (prevents order ID enumeration exposing customer PII)
- Koko webhook HMAC signature verification
- Inventory rollback on Koko payment initiation failure
- Unique constraint on `payment_events(provider_reference, event_type)` preventing duplicate webhook processing
- Admin routes gated by middleware (JWT verification TODO before production)
