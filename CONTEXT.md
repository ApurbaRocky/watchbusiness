# AURUM — Luxury Watch Business Landing Page

**Source / Context document for the project.** Use this file as the single reference
for structure, data, theming, and all interactive behaviour, plus the pending
enhancement roadmap.

> Tech stack: **Vanilla HTML5 + Pure CSS3 + JavaScript (ES6)** — no frameworks.
> Deploy target: **GitHub Pages** (static, works fully offline except Google Fonts + images).

---

## 1. Project Overview

A premium, minimal, fully-responsive single-page e-commerce landing page for a
luxury watch brand in Bangladesh. Prices are **always in BDT (৳)**.

Current feature set (already implemented in code):

| # | Section | Features |
|---|---------|----------|
| 1 | Header / Nav | Sticky glass header, brand logo, desktop nav, mobile hamburger drawer, cart icon with live badge, real-time search box, Day/Night theme toggle |
| 2 | Hero | Serif headline, animated SVG watch with rotating hands, floating spec chips, Shop Now / Explore Collection CTAs, trust stats |
| 3 | Product Showcase | Responsive grid, watch image, brand, title, spec chips, BDT price (+ strikethrough old price), Add to Cart |
| 4 | Cart Drawer | Slide-out right panel, qty stepper (+/−), remove item, subtotal & total in BDT, free delivery, "Proceed to Checkout" |
| 5 | Checkout Modal | Itemised order summary, total payable, Place Order → writes to simulated order log, success screen, toast |
| 6 | Compare | 3 product dropdowns (A/B/C), side-by-side table (Movement, Glass, Water resistance, Strap, Price, Action) |
| 7 | Payment | bKash, Nagad (personal: **01858-533944**), Rocket, Upay, Visa/Mastercard, **Cash on Delivery (COD)** cards + secure checkout note |
| 8 | Reviews | Star-rating grid with verified-buyer badges + interactive comment form (name, star picker, comment) appended via JS |
| 9 | Admin (simulated) | Passcode gate, sales summary stats (orders, revenue, units, avg order), add-product form, manage/delete product list, **recent orders log** |
| 10 | Footer | Quick links, Bangladesh contact (phone/email/address), social icons, payment badges, copyright |
| 11 | Product Marquee | Auto-scrolling ticker above the collection showing **every product** (name + BDT price + tag); pauses on hover, updates on add/delete |

---

## 2. File Structure

```
watchbusiness/
├── index.html     # All semantic HTML (header, main, sections, footer, drawer, modals)
├── style.css      # CSS variables + full styling + responsive media queries
├── script.js      # All ES6 logic (IIFE, 'use strict')
└── CONTEXT.md     # This document
```

---

## 3. Design System

### 3.1 Themes
- Default **Dark** (`data-theme="dark"` on `<html>`), toggled to Light.
- Persisted in `localStorage` key: `aurum-theme`.
- Toggled by `#themeToggle` → `applyTheme(next)` in `script.js`.

### 3.2 Core CSS variables (`:root` = dark, `[data-theme="light"]` overrides)

| Variable | Dark | Light | Purpose |
|---|---|---|---|
| `--bg` | `#0b0e15` | `#f6f1e8` | page background |
| `--bg-soft` | `#10141e` | `#efe8db` | alt section / footer |
| `--surface` | `#161c29` | `#ffffff` | cards |
| `--surface-2` | `#1c2334` | `#faf6ee` | nested cards |
| `--text` | `#ece8df` | `#2a2f3a` | body text |
| `--muted` | `#9aa3b5` | `#6a7180` | secondary text |
| `--heading` | `#faf7f0` | `#171b24` | headings |
| `--accent` | `#c9a35c` | `#b1863c` | gold accent |
| `--accent-2` | `#e0bb7f` | `#c9a35c` | gold light |
| `--accent-deep` | `#a57f3f` | `#96691f` | gold dark |
| `--accent-grad` | gold gradient | gold gradient | buttons/badges |
| `--rose` | `#d9a29b` | `#c08a83` | rose gold secondary |
| `--success` | `#59c98d` | `#2ea368` | verified / success |
| `--danger` | `#e2685f` | `#d34f45` | delete / errors |
| `--border` | `rgba(255,255,255,.09)` | `rgba(23,27,36,.12)` | borders |
| `--font-serif` | — | — | `Playfair Display` (headings) |
| `--font-sans` | — | — | `Manrope` (body) |

Watch-illustration vars: `--strap`, `--case-dark`, `--dial`, `--hand` (used by the
inline hero SVG and the JS SVG generator).

### 3.3 BDT currency format
`fmt(n)` in `script.js` → `'৳ ' + Number(n).toLocaleString('en-US')`
Example: `fmt(18500)` → `৳ 18,500`.

---

## 4. Data Layer (localStorage)

All persistent keys are defined in the `K` constant in `script.js`.

| Key | Content | Notes |
|---|---|---|
| `aurum-theme` | `"dark"` / `"light"` | applied at load |
| `aurum-cart` | `[{ id, qty }]` | cart lines |
| `aurum-products` | product array (see schema) | seeded from `PRODUCT_DEFAULTS` |
| `aurum-reviews` | review array | seeded from `SAMPLE_REVIEWS` |
| `aurum-orders` | simulated order array | seeded once, grows on "Place Order" |
| `aurum-admin` (sessionStorage) | `"1"` | admin unlock flag |

### 4.1 Product schema
```js
{
  id: 1,                       // number (Date.now() for admin-added)
  name: 'Classic Heritage Gold',
  brand: 'AURUM',
  category: 'Dress',           // Automatic | Chronograph | Diver | Dress | GMT | Quartz
  price: 18500,                // BDT number
  oldPrice: 21500 | null,      // strikethrough reference price
  movement: 'Automatic',       // Automatic | Quartz | Mechanical | Hybrid
  glass: 'Sapphire',           // Sapphire | Domed Sapphire | Mineral
  water: '50M',                // 30M | 50M | 100M | 200M | 300M
  strap: 'Italian Leather',    // Italian Leather | Stainless Steel | Brushed Steel | Alligator Leather | Rubber
  case: 'gold',                // image variant key (see 4.2)
  image: null,                 // optional explicit URL (admin input) — overrides generator
  tag: 'Best Seller' | null    // badge text
}
```

### 4.2 Image variants (`VARIANTS` in `script.js`)
`gold`, `rose`, `silver`, `navy`, `black`, `pearl`, `bronze`.
Each contains `{ case, caseDark, dial, hand, strap, accent, bg, marker }` used to
draw a data-URI watch SVG via `watchSvg(variant, brand)`.

`resolveImage(p)` → returns `p.image` if set, otherwise the generated SVG.
(Planned enhancement: swap default products to **Unsplash photo URLs** — see §7.)

### 4.3 Review schema
```js
{ id, name, rating (1–5), verified (bool), comment, date? }
```

### 4.4 Order schema
```js
{ id: 'ORD-1001', productId, qty, amount, ts (epoch ms) }
```
Seeded with ~24–37 pseudo-random orders (deterministic PRNG, seed 2024).

---

## 5. Script Map (`script.js`)

| Function | Purpose |
|---|---|
| `applyTheme(t)` | set `data-theme` + persist |
| `toast(msg, type)` | bottom-right toast ('', success, error) |
| `applyFilter()` | live search over name/brand/category/movement/glass/strap/tag; toggles `#noResults` + `#resultInfo` |
| `renderProducts(list)` | build `.product-card` grid |
| `addToCart(id, qty)` | add/merge cart line, toast, re-render |
| `setQty(id, delta)` | stepper +/−, auto-remove at 0 |
| `removeFromCart(id)` | remove line |
| `renderCart()` | badge count, drawer items, subtotal/total, empty state |
| `openCart()` / `closeCart()` | drawer + overlay |
| `openCheckout()` / `placeOrder()` | summary modal → append orders, clear cart, success screen |
| `renderCompare()` | fills A/B/C selects, builds compare table, Add-to-Cart per column |
| `renderReviews()` / `paintStars()` | review grid + star picker |
| `renderStats()` | admin stat cards from `getOrders()` |
| `renderOrders()` | admin recent-orders log (top 8 by date) |
| `renderManage()` / `showDashboard()` / `showLogin()` | admin product list + access gate |
| `renderMarquee()` | builds the auto-scrolling product ticker (content duplicated for seamless loop) |
| `updateActiveLink()` | scrollspy for nav `.active` |

### Key element IDs (HTML)
Search: `searchInput`, `searchClear`. Cart: `cartToggle`, `cartCount`, `cartDrawer`,
`cartBody`, `cartItems`, `cartEmpty`, `cartFoot`, `cartSubtotal`, `cartTotal`,
`cartHeadCount`, `checkoutBtn`. Modal: `checkoutModal`, `checkoutList`,
`checkoutTotal`, `placeOrderBtn`, `modalClose`, `checkoutBack`. Products: `productGrid`,
`productManageList`. Compare: `compareA/B/C`, `compareTableWrap`. Reviews:
`reviewsGrid`, `reviewForm`, `starPicker`, `reviewName`, `reviewComment`. Admin:
`adminLogin`, `adminDash`, `adminPassword`, `adminLoginForm`, `adminError`, `adminLogout`,
`adminStats`, `ordersList`, `ordersCount`, `addProductForm` (+ `pTitle, pBrand, pPrice,
pCategory, pImage, pCase, pMovement, pGlass, pWater, pStrap, pTag`). Nav: `navToggle`,
`mobileNav`, `themeToggle`. Marquee: `marqueeTrack`.

---

## 6. Admin Access (demo)

- **Passcode:** `aurum2024` (shown on the login card as a hint)
- Gate stored in `sessionStorage['aurum-admin']`
- Wrong passcode → red error text; correct → dashboard (stats + add product + manage list)

---

## 7. Enhancement Roadmap (from latest client request)

These changes are **planned/queued** — the code currently uses the SVG generator.

### 7.1 Famous watch images from Unsplash
- Add an `image` URL to each of the 8 default products using **real** `images.unsplash.com`
  photo IDs (format: `https://images.unsplash.com/<photo-id>?w=640&q=80&auto=format&fit=crop`).
- Keep `resolveImage()` logic: `p.image` wins; SVG generator stays as fallback for
  admin-added products with no URL.
- **Status:** photo IDs still to be verified (network verification was blocked in the
  working environment — EPERM on `Invoke-WebRequest`). Verify IDs before committing.

### 7.2 Professional background
- Add a subtle fixed/body background layer (deep gradient + faint radial glow + optional
  very-low-opacity texture image) behind hero and sections, kept above `--bg` but below
  all content. Add a corresponding light-mode variant.

### 7.3 COD (Cash on Delivery) emphasis
- COD card already exists in Payment section — add:
  - `COD` badge on each product card (`product-tag` variant)
  - COD line inside cart drawer & checkout summary
  - Delivery methods list (Home Delivery / COD / pickup) on the detail view

### 7.4 Single product page (loop view for every product)
One dynamic view, reused for **every** product (single loop in JS):
- New `#productModal` (same overlay pattern as checkout modal) built with a loop over
  product data when a card is clicked or a "Quick View" button is pressed.
- Content: large image, name, brand, price + old price, rating, spec table (Movement,
  Glass, Water resistance, Strap, Case), quantity stepper, "Add to Cart",
  "Buy Now (COD)" button, delivery/payment info chips, and 3 "Related products".
- Wire: `productGrid` click → closest `[data-view]` → `openProductModal(id)`.

---

## 8. Deployment (GitHub Pages)

1. Push the repo (keep files at repo root).
2. Repo → Settings → Pages → Source: **Deploy from a branch** → `main` / root.
3. Site served from `index.html` at `https://<user>.github.io/<repo>/`.
4. All assets are relative (`style.css`, `script.js`) so no path config needed.

---

## 9. Notes & Conventions

- No code comments by convention (self-documenting via naming) — **except** this doc.
- Always format money with `fmt()` — never hardcode `৳` strings.
- Never introduce frameworks; keep Vanilla ES6 only.
- Data changes (add/delete product) must call `renderProducts()`, `renderCompare()`
  and `renderManage()` so all views stay in sync.
