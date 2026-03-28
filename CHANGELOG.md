# Changelog

All notable changes to lk-parts will be documented in this file.

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
