# AMESH — WordPress/Elementor → Shopify/Dawn Migration

Source of truth: https://ameshstudios.com/ (WordPress + Elementor)
Target: this repo, Dawn theme, live at the connected Shopify store.

This document is the audit + mapping requested for the migration. It reflects the
actual site as inspected (desktop + mobile), and the actual theme code as built.
Where the current implementation deviates from the rules in this brief, it is
called out explicitly in **Section 6 — Known deviations / cleanup backlog** rather
than glossed over.

---

## 1. Global design system audit

### 1.1 Header / navigation
- Logo: black wordmark image (`amesh-logo.webp`), top-left, links to `/`.
- Desktop nav: inline text links, no background, sits in the same row as the logo.
  Items: **Shop** (dropdown), **Our Story**, **Craft**, **Circularity**, **AMESH
  Global**, **Archive**, **Press**. Right side: **Search** (text label, not just an
  icon), account icon, cart icon with count bubble.
- Shop dropdown items: Shop all, One of a kind, Knitwear, Shirts, Jackets, Shorts,
  Trousers, Accessories.
- No visible announcement bar on the source site (Dawn's announcement bar is
  present in the theme but empty by default — left as-is, not filled with fake copy).
- Mobile nav: hamburger drawer (native pattern, not custom-built on the source
  either — WordPress used the same Flatsome/Elementor hamburger-drawer convention).

### 1.2 Typography
- Headings: **Oswald**, bold (700), uppercase, condensed. Used for the hero
  wordmark, section headings, product titles.
- Body / nav / UI text: **Rubik**, regular (400).
- Hero wordmark: ~9vw fluid size on desktop, scales down to ~4rem on mobile.
- No custom letter-spacing beyond Oswald's natural tracking; nav links are normal
  case, not uppercase.

### 1.3 Colour
- Background: white (`#FFFFFF`) throughout content areas.
- Text: near-black (`#121212` / `#1D1D1D`), matching Dawn's default ink colour —
  no change needed here.
- Accent red: `#E74C3C`, sampled directly from the live site's "Sold Out" label
  and reused for the hero heading and sold-out badges.
- Hero overlay wordmark: a fixed blue → purple → teal gradient
  (`#3B5BFD → #8B5CF6 → #2DD4BF`), composited over the background video with
  `mix-blend-mode: color` so the video's own luminance/texture shows through the
  letters. Confirmed by pixel-sampling reference frames rather than guessed.

### 1.4 Spacing / grid / images
- Page content is **edge-to-edge (full-bleed)** almost everywhere — homepage
  banners, collection grids, and editorial galleries all run to the viewport edge,
  not Dawn's default centred `page-width` container.
- Homepage/product-grid columns: **4 desktop / 2 mobile**, zero (or near-zero)
  gutter between cards.
- Editorial two-up banners (Our Story/Craft, Press/AMESH Global, Archive,
  AMESH Global galleries): full-viewport-height (`100vh`) panels, 2 columns
  desktop / 1 column mobile, images cropped to fill (`cover`), captions centred
  over the image in regular-weight Rubik, sentence case.
- Product images: portrait-oriented, `cover`-cropped on cards; on the product page
  itself, the gallery is a **single stacked column, no thumbnails** (Dawn's
  `gallery_layout: "stacked"`).

### 1.5 Buttons / links / hover / animation
- Buttons: solid black fill, white label, square corners (no radius) — matches
  Dawn's default button styling, so left untouched.
- Hover: images scale up slightly (~1.03×) on hover in banner/gallery grids; no
  other custom hover treatment (no underline animations, no colour shifts beyond
  Dawn's own link/button hover defaults).
- The one bespoke animation on the source site is the **hero interaction**: the
  wordmark is `position: sticky` inside a section taller than the viewport, so it
  holds its on-screen position while the background video scrolls behind it, then
  releases into normal flow as a plain heading once the video has scrolled past.
  This is intentional and was rebuilt to match, not simplified away.
- No page-transition framework (no SPA-style transitions) — standard MPA
  navigation, same as Shopify.

### 1.6 Footer
- Columns: copyright line, **Contact / Returns & Shipping / Privacy Policy**
  links, Instagram link, then an email signup field with a "Get exclusive access
  first" button.
- No multi-column link farm — deliberately minimal.

### 1.7 Product cards / product page / collection page
- Product card: image, title, "one of a kind" caption line, price, "Sold Out"
  label in red when unavailable — left-aligned, no border, no shadow.
- Collection pages: **no page title, no filter/sort bar** — straight from the
  header into the product grid. This is a deliberate source-site choice, not an
  oversight, and was preserved rather than "fixed" with Dawn's default filter UI.
- Product page: sticky info column (title → description → "Free worldwide
  shipping" → price → variant/buy buttons → **Details / Size & Fit / Care /
  Note** accordions) beside a scrolling stacked image gallery, then a
  **"Discover more"** related-products row.

### 1.8 Cart / search
- Cart: standard slide-out drawer pattern (Dawn's native cart drawer) — the
  source site's WooCommerce cart used the same convention, no bespoke behaviour
  to reproduce.
- Search: Dawn's predictive search, unmodified — the source site's search was a
  standard WordPress search, no custom UX to preserve.

---

## 2. Page inventory → Shopify mapping

| Source page | Elementor structure (summary) | Shopify template | Notes |
|---|---|---|---|
| Home | Video hero → 2-up banner → product grid → 3 banners → 2-up banner | `templates/index.json` | Custom sections, see §3 |
| Product (all products) | Gallery + sticky buy box + accordions + related | `templates/product.json` | Uses Dawn's native `main-product` + `related-products`, reconfigured — no custom section needed |
| Collection (Shop all, Knitwear, Accessories, etc.) | Bare 4-col grid | `templates/collection.json` | Dawn's native `main-collection-product-grid`, filters/title disabled |
| Our Story | Image + bio text, 2-col | `templates/page.our-story.json` | Custom section (§3) |
| Craft | Video banner → centred intro → 2× image/text | `templates/page.craft.json` | Custom sections (§3) |
| Circularity | Full-width banner → 2× image/text | `templates/page.circularity.json` | Custom sections (§3) |
| Archive | 10-item photo gallery, 2-col | `templates/page.archive.json` | Custom section (§3) |
| AMESH Global | 6-item photo gallery + related products | `templates/page.amesh-global.json` | Custom section (§3) |
| Press | Press-logo grid, 4-col | `templates/page.press.json` | Custom section (§3) |
| Contact | Contact form + details | `templates/page.contact.json` | Dawn's native `contact-form` section |
| Returns & Shipping | Policy text | Page body (default `page.json`) | Plain rich text, no custom section needed |

---

## 3. Reusable elements → Shopify sections/snippets

| Reusable element on source site | Shopify implementation | Why custom (vs. stock Dawn) |
|---|---|---|
| Full-bleed autoplay video hero with sticky blended wordmark | `sections/amesh-hero-video.liquid` + `assets/section-amesh-hero-video.css` | Dawn has no video-hero section; the sticky/blend-mode interaction is bespoke to this brand |
| Full-bleed N-column photo banner/gallery with optional overlay heading and per-image caption | `sections/amesh-photo-banner.liquid` + `assets/section-amesh-photo-banner.css` | Reused across Home, Craft, Circularity, Archive, AMESH Global, Press — one configurable section instead of five one-off ones |
| Alternating image + heading + rich text ("editorial split") | `sections/amesh-split-content.liquid` + `assets/section-amesh-split-content.css` | Dawn's `image-with-text` requires a merchant-uploaded (`image_picker`) image; this variant takes a theme-asset filename so editorial photos can ship with the theme code instead of requiring a manual admin upload step per image |
| Accent-coloured heading | `.text-accent-red` utility class in `assets/base.css` + a checkbox on `rich-text`'s heading block | Small, contained addition to a stock section rather than a full custom section |
| Sold-out / accent colour scheme | `scheme-6` in `config/settings_data.json` | Native Dawn colour-scheme mechanism, no code change |

---

## 4. Global style → Shopify theme setting mapping

| Elementor global style | Shopify theme setting |
|---|---|
| Heading font (Oswald) | `settings.type_header_font` = `oswald_n7` |
| Body font (Rubik) | `settings.type_body_font` = `rubik_n4` |
| Accent red | `color_schemes.scheme-6` (`#E74C3C`) |
| Grid gutter | `settings.spacing_grid_horizontal` / `spacing_grid_vertical` (set to theme minimum, 4px) |
| Card border/shadow | `settings.media_border_thickness` = 0 (flat, no border) |
| Sold-out badge | `settings.sold_out_badge_color_scheme` = `scheme-6` |
| Social links | `settings.social_instagram_link` |

---

## 5. Content → Shopify data source mapping

| Content type | Source | Shopify destination |
|---|---|---|
| Products (23 total: knitwear + bags) | WooCommerce product pages | Shopify products, imported via CSV with real titles, full descriptions, prices, sold-out state, and real photos (Shopify pulled the images directly from the source `Image Src` URLs at import time) |
| Collections | WooCommerce product categories | Shopify collections: **Knitwear** (19), **Accessories** (4), **One of a Kind** (23, all products), plus **Shop all** |
| Navigation | Elementor nav menu | Shopify Online Store → Navigation, main menu + footer menu, same structure/labels |
| Page copy (Our Story, Craft, Circularity, Returns & Shipping, Contact details) | Elementor page content | Copied verbatim into the corresponding section settings / page body |
| Page imagery (banners, editorial photos, galleries) | WordPress media library | Downloaded from the live site and shipped as theme assets (`assets/amesh-*`, `assets/amesh-page-*`) |
| Hero video | WordPress media library | Downloaded and shipped as a theme asset (`assets/amesh-hero-video.webm`) |
| Logo | WordPress media library | Downloaded and shipped as a theme asset (`assets/amesh-logo.webp`), wired as a fallback in `sections/header.liquid` when no logo is set in the customizer |

---

## 6. Known deviations / cleanup backlog

Being transparent about where the current build cuts a corner relative to the
architecture rules in this brief, so it can be prioritised rather than hidden:

1. **`!important` usage.** `.text-accent-red` in `assets/base.css` uses
   `!important` to win against a more specific rule in `component-rich-text.css`.
   Should be replaced with a properly scoped selector instead.
2. **Custom sections take image filenames as plain text, not `image_picker`.**
   `amesh-photo-banner` and `amesh-split-content` reference theme-asset filenames
   by typing them into a text field, rather than using Shopify's native
   `image_picker` (which requires the merchant to upload via Admin). This was a
   deliberate trade-off to ship real imagery without needing a manual upload step
   per image, but it means a merchant can't swap these images through the
   customizer's normal image picker UI — only by editing the filename and pushing
   a new asset. Worth revisiting: either upload the images as Shopify files and
   switch these fields to real `image_picker`s, or clearly document the
   text-filename convention for future editors.
3. **Craft page hero is a static frame, not the live video.** The source page
   uses two autoplaying background videos in that banner; the current build uses
   a still frame extracted from each to keep scope bounded. If full fidelity is
   required here, this should become a second instance of the video-hero pattern.
4. **Press page.** The logo grid is a straight `cover`/`contain` grid of a subset
   of the source site's press mentions, not the exact masonry arrangement (which
   mixes photo tiles and logo tiles in a specific hand-placed order). Faithful to
   "real press logos, real layout family," not pixel-identical to the source.
5. **Contact page body copy.** The address/phone/email text entered on the page
   doesn't currently render, because Dawn's `contact-form` section renders its
   own fixed markup and doesn't pull in the page body. Needs either a small
   template edit to surface `page.content` above the form, or those details
   moved into the section's own settings.
6. **Mobile-specific responsive audit.** Desktop was audited in detail (exact
   pixel widths/heights via live measurement). Mobile was checked for the hero
   and homepage but not exhaustively re-verified page-by-page against the
   source's actual mobile behaviour (as opposed to the desktop layout reflowing).
   This is the most likely place for silent fidelity gaps.
7. **Accessibility pass not yet done.** Semantic structure follows Dawn's
   existing (already-accessible) patterns for stock sections, but the new custom
   sections (`amesh-photo-banner`, `amesh-hero-video`, `amesh-split-content`)
   haven't had a dedicated accessibility review (focus order, alt text on
   background-image banners, reduced-motion handling for the hero video).

---

## 7. Implementation phase status

| Phase | Status |
|---|---|
| 1. Audit | Done — this document, §1 |
| 2. Architecture/migration plan | Done — this document, §2–5 |
| 3. Global design system | Done — fonts, colours, spacing, grid (§1.2–1.4) |
| 4. Header/nav/footer | Done |
| 5. Page templates | Done — all 11 templates in §2 |
| 6. Product/collection/cart/search | Done — cart & search left as Dawn defaults per audit (§1.8) |
| 7. Responsive behaviour | Partial — see §6.6 |
| 8. Compare against source | Ongoing — done for desktop hero, homepage, product page, collection pages; not yet re-verified for every content page on mobile |
| 9. Iterate on differences | Open — see §6 for the current backlog |
