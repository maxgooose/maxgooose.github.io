# Hero Section + Mobile Nav — Research & Options

## Current State
- **Hero:** `.smf-hero` — dark background, SVG pattern, logo + text. No imagery. Clean but feels like a placeholder.
- **Mobile nav:** Inherited Webflow hamburger. Opens full-height overlay with all links. Functional but generic.

---

## HERO OPTIONS (Mobile-First)

### Option A: Full-Bleed Video Hero ⭐ RECOMMENDED
**What:** `syria-promo.mp4` plays full-width behind text overlay. Dark gradient overlay for readability.
**Mobile:** Static image fallback (`trip-hero-mobile.jpg` already exists). Video only loads on desktop/WiFi.
**Why:** Intrepid Travel, G Adventures, and every top travel site uses this. Nothing sells a destination like motion. We already have the video.
**Structure:**
```
[video/image fills viewport]
  [dark gradient overlay]
    [logo small, top-left]
    [centered: headline + subtitle + CTA button]
```
**Effort:** Medium — HTML restructure + CSS. No new assets needed.
**Mobile behavior:** `<picture>` with `trip-hero-mobile.jpg` at small sizes. Video only at 768px+.

### Option B: Split Hero (Text + Image)
**What:** Left: headline + tagline + CTA. Right: large photo (e.g., `umayyad-courtyard-wide.jpg`).
**Mobile:** Stacks vertically — text on top, image below.
**Why:** Editorial feel. National Geographic, Smithsonian use this. Easy to read, fast loading.
**Effort:** Low — CSS grid/flex layout change.

### Option C: Image Carousel Hero
**What:** Rotating background images (Damascus, Palmyra, Aleppo, Umayyad). Auto-advances. Text overlay.
**Mobile:** Same but touch-swipeable. Use existing Swiper.js (already loaded).
**Why:** Shows range of destinations. Interactive.
**Effort:** Medium — need Swiper initialization + slide markup.
**Risk:** Carousels have lower engagement than static heroes (users don't wait for slides).

### Option D: Cinematic Parallax
**What:** Single dramatic full-bleed photo with subtle parallax scroll. Text anchored center.
**Mobile:** No parallax (disable on mobile), just fixed image.
**Best images:** `damascus-old-city-panorama.jpg`, `citadel-of-aleppo.jpg`, `palmyra-ruins-golden.jpg`
**Effort:** Low — mostly CSS.

### Option E: Minimal with Accent Image
**What:** Clean white/off-white hero with large headline. Small accent image or architectural cutout.
**Mobile:** Same — clean and fast.
**Assets:** `castle-top-cutout.png`, `damascus-gate-cutout.png` exist for this approach.
**Effort:** Lowest — just CSS changes.

### My Recommendation: **Option A (Video Hero)**
- We already have the video (`syria-promo.mp4`)
- We already have a mobile fallback (`trip-hero-mobile.jpg`)
- It's what every serious travel company uses
- Most impactful first impression
- Mobile gets a static image = fast loading

---

## MOBILE NAV OPTIONS

### Option 1: Bottom Tab Bar ⭐ RECOMMENDED
**What:** Fixed bar at bottom of screen with 4-5 icons + labels. Like Instagram/Airbnb/any modern app.
**Items:** Home | Travels | Media | Shop | Book Now
**Why:**
- Thumb-friendly (bottom of screen = easy reach)
- Always visible (no hunting for hamburger)
- Users already understand this pattern from every app they use
- "Book Now" as highlighted/accent tab = conversion
**Effort:** Medium — new CSS component, JS for active state
**Reference:** Airbnb mobile, Booking.com mobile, Hotels.com mobile

### Option 2: Sticky Compact Header + Hamburger
**What:** Small sticky header: logo left, hamburger right. Opens full-screen overlay or slide-out drawer.
**Why:** Standard, works everywhere, low effort.
**Downside:** Hamburger menus hide navigation = lower discoverability.
**Effort:** Low — mostly CSS tweaks to current setup.

### Option 3: Slide-Up Sheet (iOS style)
**What:** Small floating button or bar at bottom. Tap to slide up a navigation sheet from bottom.
**Why:** Modern, native-feeling. Apple uses this pattern.
**Downside:** Less common on web, users may not discover it.
**Effort:** Medium-high — custom JS + CSS animations.

### Option 4: Sticky Header + Bottom CTA
**What:** Minimal sticky top nav (logo + hamburger). Persistent "Book Now" button fixed at bottom.
**Why:** Separates navigation from conversion. CTA always visible.
**Effort:** Low — CSS positioning.

### My Recommendation: **Option 1 (Bottom Tab Bar)**
- SMF has exactly 5 pages = perfect for tab bar (5 is the max)
- Cultural tourism sites need "Book Now" always visible
- Mobile users already trained by Airbnb/Booking.com
- Massive improvement over hidden hamburger menu

---

## IMPLEMENTATION PLAN

### Phase 1: Mobile Nav (do first — affects all pages)
1. Build bottom tab bar component
2. Icons: Home (house), Travels (compass), Media (play), Shop (bag), Book (calendar)
3. Add to all pages
4. Hide desktop nav on mobile, show tab bar
5. Test on mobile viewport

### Phase 2: Hero Replacement
1. Replace `.smf-hero` with video hero structure
2. Mobile: static image with gradient overlay + centered text
3. Desktop: video background with same overlay
4. Keep logo, headline, subtitle, CTA
5. Test both breakpoints

---

## Assets Available
| Asset | Use |
|-------|-----|
| `syria-promo.mp4` | Video hero (desktop) |
| `trip-hero-mobile.jpg` | Hero fallback (mobile) |
| `trip-hero.jpg` | Hero fallback (desktop, if no video) |
| `umayyad-courtyard-wide.jpg` | Alt hero image |
| `citadel-of-aleppo.jpg` | Alt hero image |
| `damascus-old-city-panorama.jpg` | Alt hero image |
| `palmyra-ruins-golden.jpg` | Alt hero image |
| `castle-top-cutout.png` | Accent/minimal hero |
| `damascus-gate-cutout.png` | Accent/minimal hero |

---

*Research by Tartz ⚡ — Feb 2, 2026*
