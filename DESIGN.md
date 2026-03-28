# lk-parts Design Specification

Extracted from the full design document. All decisions below are binding.
Last updated: 2026-03-28. Source: `teransarathchandra-unknown-design-20260328-132140.md`.

---

## Color Tokens

```css
--accent:         #CC2200;   /* primary red — buttons, badges, active states */
--accent-light:   #FEE2E2;   /* red tint — hover/chip backgrounds */
--text-primary:   #111111;
--text-secondary: #666666;
--border:         #E5E5E5;
--bg:             #FFFFFF;
--bg-subtle:      #F9FAFB;

/* Fitment badge colors */
--fit-exact-bg:   #065F46;   /* dark green (exact fit) */
--fit-compat-bg:  #92400E;   /* amber-dark (compatible) */
--fit-unknown:    #6B7280;   /* gray text, no background (unknown) */
```

## Typography

Font: **Geist Sans** via `next/font/google`. No fallback to Inter/Roboto/system.

| Element         | Size  | Weight | Notes                                |
|----------------|-------|--------|--------------------------------------|
| Product name   | 18px  | 600    |                                      |
| Price          | 22px  | 700    | Prominent, colored `--accent`        |
| OEM part #     | 13px  | 400    | `--text-secondary`, below name       |
| Body text      | 15px  | 400    |                                      |
| Filter chips   | 13px  | 500    |                                      |
| Fitment badge  | 12px  | 600    |                                      |

- Line heights: 1.4 body, 1.2 headings
- Letter spacing: -0.01em headings, 0 body

## Spacing

4px base scale: 4, 8, 12, 16, 24, 32, 48, 64

## Border Radius

- Cards: 8px
- Chips: 4px
- Inputs: 2px

Shadows: **None**. Trust is earned by clarity, not decoration.

---

## Global Navigation (Mobile)

```
[Logo]                    [🔍] [Garage indicator] [🛒 badge]
```

- Garage indicator: vehicle nickname if saved, dot icon if not
- No hamburger menu

---

## Homepage (New User, First Visit)

```
Hero: "Find parts that fit your exact vehicle."
Vehicle selector card (4 dropdowns: Type → Brand → Model → Variant)
  → [Show parts →] CTA
Secondary: "Or search by part number" [input]
Below fold: Popular vehicles (Honda CB150R, Yamaha FZ-S, Toyota Corolla, ...)
```

---

## Catalog Page Hierarchy

```
1. Saved vehicle banner "Honda CB150R EX" [change]
2. Sub-section filter chips (scrollable): [Engine] [Brakes] [Filters] ...
3. Product grid (2-col, mobile): exact + compatible products
4. Separator: "Not yet verified for your vehicle"
5. Products with unknown fitment (below separator)
```

---

## Vehicle Selector (All Contexts)

4 native `<select>` elements stacked vertically. Each disabled until parent selected.
Use OS-native picker — no custom dropdown. Data from `GET /api/vehicles` (cached 24h, client-side filtered).

---

## Catalog Card

```
┌─────────────────────────────────┐
│ [product image]   ◢ Free return │  ← corner ribbon (exact-fit only)
│                                 │
│ Honda CB150R Oil Filter         │  ← 18px/600
│ 15400-PLM-A02                   │  ← 13px/400 muted
│ LKR 1,200                       │  ← 22px/700 red
│ ✓ Fits CB150R EX                │  ← 12px dark green badge
│ In Stock (12)                   │  ← 12px gray
└─────────────────────────────────┘
```

Variants:
- Out-of-stock: 60% opacity, "Out of stock" pill, no add-to-cart
- Low-stock: amber "Low Stock (2)" chip
- No-image: gray placeholder with sub-section icon silhouette

---

## Product Page

```
Product name
[✓ Fits your Honda CB150R EX]           ← exact: dark green badge
[🛡 Wrong part? Free return within 7 days — guaranteed.]
LKR 2,450    ~~LKR 2,800~~
OEM: 15400-PLM-A02
Ordered 47 times for Honda CB150R EX
[In Stock (12)]  [Add to cart]
```

Compatible fitment: amber badge, no guarantee box, show "Ask via WhatsApp ↗" button.
Unknown fitment: gray text, no background, no guarantee box.

---

## Fitment Badge Screen Reader

```
aria-label="Fits your Honda CB150R EX — wrong part free return guaranteed"
```

---

## Interaction States

| Feature        | Loading              | Empty                                  | Error                        | Success                  |
|---------------|----------------------|----------------------------------------|------------------------------|--------------------------|
| Catalog        | 6-card skeleton      | "No parts listed for [vehicle] yet."   | Toast + retry                | Cards appear             |
| Search         | Inline spinner       | "No results for '[q]'. Ask WhatsApp."  | Toast + retry                | Results with badges      |
| Add to cart    | Button "Adding..."   | —                                      | Toast "Out of stock"         | "Added ✓" 2s green       |
| OTP send       | "Sending..."         | —                                      | Inline error                 | Code input appears       |
| OTP verify     | "Verifying..."       | —                                      | "Wrong code. [N] left."      | Advances step            |
| COD checkout   | "Placing order..."   | —                                      | Toast + specific error       | Order confirmation page  |
| Koko checkout  | "Redirecting..."     | —                                      | Toast + COD fallback         | Redirect to Koko         |
| Admin confirm  | "Confirming..."      | —                                      | Toast "Failed — try again"   | "Confirmed ✓" 3s         |

**Koko pending payment banner (cart page, post-redirect-return):**
Sticky banner at top: "You have a payment in progress — [View order #1247]"
Not a modal. Not a full-page error.

---

## Checkout Flow (3-step multi-page)

```
Step 1/3 — Your details
  Phone: [077 ________]  Name: [__________]
  Delivery address: [________________]
  [Continue →]

Step 2/3 — Verify
  "We sent a code to 077 xxx xxxx"
  [_ _ _ _ _ _]  (6-digit OTP)
  Resend code (58s countdown)
  [Continue →]

Step 3/3 — Review + Pay
  Order summary
  Delivery fee: LKR 350
  Total: LKR X,XXX
  Payment: [Cash on Delivery | Koko Pay]  ← segmented control
  [Place Order (Cash on Delivery)]
```

---

## Admin Panel (Mobile-first)

Vertical card stack, not a data table.

```
Admin — Orders · 3 pending COD
─────────────────────────────────────
#1247 — Kamal S. — CB150R Oil Filter
LKR 2,800 · COD · ● COD pending
[✓ Confirm COD]   [WhatsApp ◦]
─────────────────────────────────────
```

- COD confirm: default → "Confirming..." → "Confirmed ✓" (3s) → row updates
- WhatsApp button: disabled if customer.phone is null. Never 500.

---

## Order Status Page (Customer)

URL: `/orders/[id]`
Access: confirm last 4 digits of phone before showing details.
No full login required. Works from any link (WhatsApp, SMS).

---

## Accessibility

- Touch targets: minimum 44×44px
- Contrast: `#CC2200` on white = 4.5:1 (AA large text), white text on red = 5.2:1 ✓
- Vehicle selector: native `<select>` (keyboard accessible)
- Payment segmented control: `role="tablist"` + `role="tab"`, arrow key navigation
- Skip-to-main link for keyboard/screen reader users
- All product images: meaningful `alt` text (product name + vehicle)

---

## Out of Scope (Phase 1)

- Dark mode
- Sinhala/Tamil language toggle
- Animated product image carousel
- Loyalty/rewards UI
- Product comparison view
- Advanced admin analytics dashboard
