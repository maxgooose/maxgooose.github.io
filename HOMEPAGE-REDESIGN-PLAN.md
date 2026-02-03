# SMF Homepage Mobile Redesign Plan

> **Goal:** Transform the homepage from "disgusting" to polished, modern, and institutional on mobile devices (≤768px).  
> **Constraint:** CSS-only changes in `styles.css`. No HTML modifications. Must coexist with the Webflow CDN CSS + local overrides approach.  
> **Approach:** Override existing mobile media queries. All changes target the `@media (max-width: 768px)` block.

---

## Design Principles (Informed by Top Foundations)

After studying Ford Foundation, Aga Khan Development Network, Getty, charity:water, and Smithsonian — the best foundation mobile sites share these traits:

1. **Generous vertical rhythm** — Sections feel like deliberate "rooms," not cramped text walls
2. **One idea per screen** — Each section should fill roughly one viewport height worth of content
3. **Typographic hierarchy** — Clear size jumps between section labels, headings, and body text
4. **Breathing room** — 40–60px between major sections minimum
5. **Full-bleed imagery** — Cards and images go edge-to-edge on mobile
6. **Refined micro-details** — Rounded corners, consistent padding, subtle shadows
7. **Dark/light rhythm** — Alternating section backgrounds create visual pace

---

## Section-by-Section Mobile Issues & Fixes

### 1. 🏛️ Hero Section (`.smf-hero`)

**Current problems:**
- Logo is too small at 90px width on mobile
- Title + subtitle feel vertically cramped
- No scroll indicator — users may not know to scroll
- The hero feels "empty" rather than "spacious" — needs more intentional vertical layout

**CSS changes:**

```css
@media (max-width: 768px) {
  .smf-hero {
    min-height: 100svh !important;
    padding: 0 1.5rem !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .smf-hero__content {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 0 !important;
    padding: 0 !important;
    /* Push content slightly above center for visual balance */
    transform: translateY(-5vh);
  }

  .smf-hero__logo {
    width: 110px !important;
    margin-bottom: 2rem !important;
  }

  .smf-hero__divider {
    width: 48px !important;
    height: 2px !important;
    margin-bottom: 2rem !important;
    background: linear-gradient(90deg, transparent, #D4A574 30%, #D4A574 70%, transparent) !important;
  }

  .smf-hero__title {
    font-size: clamp(2.4rem, 10vw, 3.2rem) !important;
    letter-spacing: -0.01em !important;
    line-height: 1.05 !important;
    margin-bottom: 1.5rem !important;
  }

  .smf-hero__subtitle {
    font-size: 0.7rem !important;
    letter-spacing: 0.25em !important;
    line-height: 1.6 !important;
    max-width: 300px !important;
    text-align: center !important;
  }

  /* Scroll hint indicator (uses existing ::after pseudo-element space) */
  .smf-hero__content::after {
    content: '' !important;
    display: block !important;
    width: 1px !important;
    height: 40px !important;
    background: linear-gradient(to bottom, rgba(212,165,116,0.6), transparent) !important;
    margin-top: 3rem !important;
  }
}
```

---

### 2. 📖 About Section (`.home-about`, Section 01)

**Current problems:**
- Background SVG fights with text for attention at `auto 50vw` size
- The heading text (`home-heading`) at 1.4rem is too small — on mobile this should be the hero-level statement
- Section number is cramped against the heading
- No visual separation from hero above

**CSS changes:**

```css
@media (max-width: 768px) {
  .home-about {
    padding: 4rem 1.25rem 4rem !important;
    background-size: auto 35vw !important;
    background-position: 50% 80% !important;
    background-image: url('assets/images/syria-about-bg.svg') !important;
    min-height: unset !important;
    margin-bottom: 0 !important;
  }

  .section-title-and-text {
    flex-direction: column !important;
    gap: 1.5rem !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Section number: more prominent, badge-like */
  .sec-numb {
    font-size: 0.7rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    border-top: 3px solid #2C2C2C !important;
    padding-top: 0.75rem !important;
    margin-bottom: 0 !important;
    color: #555 !important;
  }

  .about-text-ctn {
    width: 100% !important;
    border-bottom: none !important;
  }

  /* Make the about heading feel like a mission statement */
  .home-heading {
    font-size: 1.55rem !important;
    line-height: 1.35 !important;
    font-weight: 400 !important;
    color: #1a1a1a !important;
  }
}
```

---

### 3. 🎠 Initiatives Slider (`.slider-main_component`, Section 02)

**Current problems:**
- Slider cards at 85% width are OK but the title overlay is hard to read on small images
- Navigation arrows are too small (3.5rem × 2rem)
- Section header and arrows feel disconnected

**CSS changes:**

```css
@media (max-width: 768px) {
  .slider-main_component {
    padding: 2rem 0 2.5rem !important;
    margin: 0 !important;
  }

  .slider-main_top-wrapper {
    padding: 0 1.25rem !important;
    margin-bottom: 1.25rem !important;
    flex-direction: row !important;
    align-items: flex-end !important;
    justify-content: space-between !important;
    gap: 0.5rem !important;
  }

  .slider-main_button-wrapper {
    flex-shrink: 0 !important;
  }

  .slider-main_button {
    width: 2.75rem !important;
    height: 2.75rem !important;
    border-radius: 50% !important;
    border-width: 1.5px !important;
  }

  .swiper-slide.is-slider-main {
    width: 78% !important;
    padding: 0 0.4em !important;
  }

  /* Taller image ratio for more visual impact */
  .slider-main_img-height {
    padding-top: 130% !important;
    border-radius: 12px !important;
  }

  /* Bolder title overlay */
  .slider-main_text-wrapper {
    border-radius: 12px !important;
    padding: 1.25rem !important;
    background-image: linear-gradient(transparent 50%, rgba(0,0,0,0.75)) !important;
  }

  .slider-main_title {
    font-size: 1.3rem !important;
    font-weight: 600 !important;
    line-height: 1.15 !important;
  }
}
```

---

### 4. 🤝 Partners Section (`.destinations-cnt` + `.benefits_layout.is-partners`, Section 03)

**Current problems:**
- Cards at 240px min-height are too short — images get cropped badly
- Text overlays are barely readable
- No visual distinction between partner types
- Spacing between section header and cards is inconsistent

**CSS changes:**

```css
@media (max-width: 768px) {
  /* Section header for 03, 04, 05, 06 */
  .destinations-cnt {
    padding: 0 1.25rem !important;
    margin-bottom: 1rem !important;
  }

  .section-title-and-text.is-03 {
    padding-top: 3rem !important;
    padding-bottom: 1rem !important;
    flex-direction: column !important;
    gap: 1.5rem !important;
  }

  /* Partner cards - taller, full-bleed feel */
  .benefits_layout.is-partners .benefits_card_wrap {
    min-height: 300px !important;
    border-radius: 16px !important;
  }

  .benefits_layout.is-partners .benefits_card_content {
    padding: 1.5rem !important;
  }

  .benefits_layout.is-partners .benefits_card_title {
    font-size: 1.35rem !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
  }

  .benefits_layout.is-partners .benefits_card_text {
    font-size: 0.88rem !important;
    line-height: 1.55 !important;
    opacity: 0.9 !important;
  }

  /* Show card descriptions by default on mobile (no hover) */
  .benefits_layout.is-partners .benefits_card_mask_wrap {
    grid-template-rows: 1fr !important;
  }

  /* Stronger gradient for text readability */
  .benefits_layout.is-partners .benefits_bg {
    background-image: linear-gradient(
      rgba(11, 26, 42, 0) 20%,
      rgba(11, 26, 42, 0.7) 55%,
      rgba(11, 26, 42, 0.95)
    ) !important;
  }
}
```

---

### 5. 💬 Quote Section (`.quote`)

**Current problems:**
- At `height: auto; min-height: 180px` the section is too short and feels like a squished banner
- Font at 1.1rem is too small for a pull-quote — this should feel impactful
- The `background-attachment: fixed` doesn't work on iOS and causes jank

**CSS changes:**

```css
@media (max-width: 768px) {
  .quote {
    min-height: 260px !important;
    height: auto !important;
    padding: 3.5rem 1.5rem !important;
    margin: 2.5rem 0 !important;
    background-attachment: scroll !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .text-block-12 {
    font-size: 1.35rem !important;
    width: 100% !important;
    line-height: 1.45 !important;
    font-weight: 600 !important;
    letter-spacing: -0.01em !important;
  }

  .text-span-4 {
    font-size: 0.5em !important;
    display: block !important;
    margin-top: 1.5rem !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    font-weight: 300 !important;
    opacity: 0.7 !important;
  }
}
```

---

### 6. ✈️ Travel Plans Cards (Section 04)

**Current problems:**
- The `.is-travel` cards look identical to partners cards — no visual distinction
- Duration label ("10 Days") is hard to see
- Cards are too short and don't showcase the beautiful destination imagery

**CSS changes:**

```css
@media (max-width: 768px) {
  /* Travel cards: taller, more cinematic */
  .benefits_card_wrap.is-travel {
    min-height: 320px !important;
    aspect-ratio: unset !important;
    border-radius: 16px !important;
  }

  .benefits_card_content.is-travel {
    padding: 1.5rem !important;
    gap: 0.25rem !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
  }

  /* Duration badge — pill style */
  .benefits_card_title.is-travel-p {
    font-size: 0.7rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    background: rgba(212, 165, 116, 0.2) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    padding: 0.3rem 0.85rem !important;
    border-radius: 100px !important;
    display: inline-block !important;
    width: fit-content !important;
    border: 1px solid rgba(212, 165, 116, 0.3) !important;
    margin-bottom: 0.5rem !important;
  }

  .benefits_card_wrap.is-travel .benefits_card_title:not(.is-travel-p) {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    line-height: 1.1 !important;
  }

  /* Gradient overlay for travel cards */
  .benefits_card_wrap.is-travel .benefits_bg {
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.9) 0%,
      rgba(0,0,0,0.6) 35%,
      rgba(0,0,0,0.15) 60%,
      transparent 80%
    ) !important;
  }

  /* CTA button under travel cards */
  .div-block-42 {
    padding: 1.5rem 1.25rem 3rem !important;
  }

  .nav-item-link.is-home-cta {
    font-size: 0.85rem !important;
    padding: 0.75rem 1.5rem !important;
    border: 1.5px solid #333 !important;
    border-radius: 100px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    transition: all 0.2s ease !important;
  }

  .nav-item-link.is-home-cta .nav-link-text {
    font-size: 0.85rem !important;
    font-weight: 500 !important;
  }
}
```

---

### 7. 🎨 Get Inspired Cards (Section 05, `.benefits_layout.is-inspired`)

**Current problems:**
- Same generic card treatment as every other section — visual fatigue
- Cards are short, don't show the beauty of Syrian locations

**CSS changes:**

```css
@media (max-width: 768px) {
  /* Taller, more immersive cards for inspiration */
  .benefits_layout.is-inspired .benefits_card_wrap {
    min-height: 360px !important;
    border-radius: 16px !important;
  }

  .benefits_layout.is-inspired .benefits_card_title {
    font-size: 1.3rem !important;
    font-weight: 600 !important;
  }

  /* Lighter gradient — let images breathe more */
  .benefits_layout.is-inspired .benefits_bg {
    background-image: linear-gradient(
      rgba(11, 26, 42, 0) 45%,
      rgba(11, 26, 42, 0.65) 70%,
      rgba(11, 26, 42, 0.9)
    ) !important;
  }
}
```

---

### 8. 🔢 Syria by Numbers (Section 06, `.benefits_layout.is-numbers`)

**Current problems:**
- Stats cards look identical to every other card section
- The numbers themselves ("6 UNESCO World Heritage Sites") don't pop — they're just more card titles

**CSS changes:**

```css
@media (max-width: 768px) {
  .benefits_layout.is-numbers .benefits_card_wrap {
    min-height: 280px !important;
    border-radius: 16px !important;
  }

  /* Make the stat number/title more prominent */
  .benefits_layout.is-numbers .benefits_card_title {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    letter-spacing: -0.01em !important;
  }

  /* Show descriptions by default on mobile */
  .benefits_layout.is-numbers .benefits_card_mask_wrap {
    grid-template-rows: 1fr !important;
  }

  .benefits_layout.is-numbers .benefits_card_text {
    font-size: 0.85rem !important;
    line-height: 1.5 !important;
  }
}
```

---

### 9. ⚡ Defined Section (`.defined`)

**Current problems:**
- The dark section is jarring — no transition from previous white section
- Accordion titles at 1.15rem are too small for a dark section
- The `long-phrases` SVGs at `width: 100%` on mobile lose the horizontal parallax effect and look broken
- Bottom text block and video feel crammed

**CSS changes:**

```css
@media (max-width: 768px) {
  .defined {
    padding: 0 !important;
    margin-top: 0 !important;
    overflow: hidden !important;
  }

  .top-cnt {
    padding: 3rem 1.25rem 2rem !important;
  }

  .defined-header {
    padding-bottom: 2.5rem !important;
    border-top-width: 1px !important;
    border-color: rgba(255,255,255,0.2) !important;
  }

  .text-block-4 {
    font-size: 0.85rem !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    font-weight: 300 !important;
    opacity: 0.7 !important;
  }

  .list-cnt {
    width: 100% !important;
  }

  /* Larger, more tappable accordion titles */
  .dropdown-title {
    font-size: 1.35rem !important;
    font-weight: 300 !important;
    line-height: 1.2 !important;
  }

  .travel-dropdown {
    padding: 1.25rem 0 !important;
    border-color: rgba(255,255,255,0.12) !important;
  }

  .traval-arrow {
    width: 1.5rem !important;
    opacity: 0.5 !important;
  }

  .dropdown-text {
    width: 100% !important;
    font-size: 0.88rem !important;
    line-height: 1.6 !important;
    opacity: 0.7 !important;
  }

  /* Hide the broken long-phrases on mobile — they cause horizontal scroll */
  .long-phrases {
    display: none !important;
  }

  .div-block-3 {
    padding: 2.5rem 1.25rem !important;
  }

  .text-block-6 {
    width: 100% !important;
    font-size: 1.1rem !important;
    line-height: 1.5 !important;
    font-weight: 300 !important;
  }

  .div-block-4 {
    padding: 0 1.25rem 2rem !important;
  }

  .video-embed {
    border-radius: 12px !important;
  }
}
```

---

### 10. 📰 Blog/News Section (`.blog-section`, Section 07)

**Current problems:**
- Cards feel like an afterthought — small text, cramped
- Blog titles at 0.95rem are too small
- The circular arrow SVG icons waste space on mobile

**CSS changes:**

```css
@media (max-width: 768px) {
  .blog-section {
    padding: 3rem 1.25rem !important;
  }

  .blog-cnt {
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
  }

  .blog-cards {
    border-radius: 16px !important;
    padding: 0.6rem !important;
    flex-direction: row !important;
    gap: 0.75rem !important;
    align-items: stretch !important;
    box-shadow: 0 2px 12px -2px rgba(26, 58, 82, 0.1) !important;
  }

  .blog-cards .card-wrapper {
    flex: 0 0 110px !important;
    border-radius: 12px !important;
  }

  .blog-image {
    aspect-ratio: 1 / 1 !important;
    width: 110px !important;
    height: 110px !important;
    border-radius: 12px !important;
    object-fit: cover !important;
  }

  .div-block-40 {
    padding: 0.4rem 0.2rem !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }

  /* Hide the circular arrow icons on mobile to save space */
  .button-arrow.needed {
    display: none !important;
  }

  .text-block-18 {
    font-size: 1rem !important;
    font-weight: 600 !important;
    line-height: 1.25 !important;
    margin-bottom: 0.35rem !important;
  }

  .blog-text {
    font-size: 0.8rem !important;
    line-height: 1.45 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }
}
```

---

### 11. 📱 Navigation Bar (`.nav-header .navbar`)

**Current problems:**
- Trying to squeeze ALL 6 nav items + CTA into one row at 0.6rem font — unreadable
- The navbar overlaps content at the bottom of the viewport
- No visual distinction between nav items

**CSS changes:**

```css
@media (max-width: 768px) {
  .nav-header .navbar {
    border-radius: 1.25rem !important;
    inset: auto 0.75rem 0.75rem 0.75rem !important;
    padding: 0.5rem 0.5rem !important;
    box-shadow: 0 4px 24px -4px rgba(0,0,0,0.15),
                0 0 0 1px rgba(0,0,0,0.04) !important;
    background: rgba(255,255,255,0.97) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
  }

  .menu-container {
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 0.15rem !important;
    padding: 0 !important;
    width: 100% !important;
  }

  .navbar .nav-item-link {
    padding: 0.35rem 0.5rem !important;
    white-space: nowrap !important;
  }

  .navbar .nav-item-link .nav-link-text {
    font-size: 0.65rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.02em !important;
  }

  .navbar .nav-item-link.is--first {
    padding-left: 0.5rem !important;
  }

  .navbar .nav-item-link.is--button {
    background-color: #1A3A52 !important;
    padding: 0.35rem 0.75rem !important;
    border-radius: 100px !important;
  }

  .navbar .nav-item-link.is--button .nav-link-text {
    font-size: 0.62rem !important;
    font-weight: 600 !important;
    color: #fff !important;
    letter-spacing: 0.05em !important;
  }

  /* Ensure bottom padding on body so nav doesn't cover content */
  body.has-fullscreen-hero {
    padding-bottom: 4.5rem !important;
  }
}
```

---

### 12. 🦶 Footer (`.travels-footer`)

**Current problems:**
- Column layout on mobile is fine but feels cramped
- Logo is too large relative to the mobile layout

**CSS changes:**

```css
@media (max-width: 768px) {
  .travels-footer {
    padding: 2.5rem 1.25rem 1.5rem !important;
  }

  .travels-footer__logo {
    height: 48px !important;
    margin-bottom: 1rem !important;
  }

  .travels-footer__tagline {
    font-size: 0.82rem !important;
    line-height: 1.55 !important;
    max-width: 280px !important;
  }

  .travels-footer__nav {
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 1.5rem !important;
  }

  .travels-footer__nav-col {
    min-width: 80px !important;
  }

  .travels-footer__divider {
    margin-top: 1.5rem !important;
    margin-bottom: 1rem !important;
  }

  .travels-footer__bottom {
    flex-direction: column !important;
    gap: 0.25rem !important;
    text-align: center !important;
  }
}
```

---

## Global Mobile Improvements

### Consistent Spacing Rhythm

```css
@media (max-width: 768px) {
  /* Section separators - consistent vertical rhythm */
  .home-about + .slider-main_component,
  .slider-main_component + .destinations-cnt,
  .destinations-cnt + .page_main,
  .page_main + .quote,
  .quote + .destinations-cnt,
  .page_main + .destinations-cnt,
  .page_main + .defined {
    margin-top: 0 !important;
  }

  /* Cards container — consistent side padding */
  .cards-wrap.u-container-2 {
    padding: 0 1.25rem !important;
    margin-bottom: 1.5rem !important;
  }

  /* All benefit card stacks get consistent gap */
  .benefits_layout {
    gap: 1rem !important;
  }

  /* All benefit cards get consistent radius */
  .benefits_card_wrap {
    border-radius: 16px !important;
  }

  /* Card content padding consistency */
  .benefits_card_content {
    padding: 1.25rem !important;
  }
}
```

### Typography Polish

```css
@media (max-width: 768px) {
  /* Consistent body text rendering */
  body {
    -webkit-text-size-adjust: 100% !important;
    text-rendering: optimizeLegibility !important;
  }

  /* Green highlight color boost for readability */
  .green-highlight {
    color: #1A3A52 !important;
    font-weight: 600 !important;
  }

  /* Section CTA links — consistent treatment */
  .nav-item-link.is-home-cta {
    font-size: 0.82rem !important;
    padding: 0.5rem 1rem !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
  }
}
```

### Performance & Polish

```css
@media (max-width: 768px) {
  /* Disable parallax/fixed backgrounds on mobile (iOS doesn't support them) */
  .quote {
    background-attachment: scroll !important;
  }

  /* Smooth scrolling for all anchor links */
  html {
    scroll-behavior: smooth !important;
  }

  /* Prevent any horizontal overflow globally */
  html, body, .page_main, .defined {
    overflow-x: hidden !important;
  }

  /* Hide decorative elements that waste space on mobile */
  .grid-wrap,
  .global-code,
  .long-phrases {
    display: none !important;
  }

  /* Contact overlay — full width on mobile */
  .contact-overlay {
    width: 100% !important;
    border-radius: 0 0 1rem 1rem !important;
    inset: 0 0 auto 0 !important;
  }
}
```

---

## Implementation Priority

| Priority | Section | Impact | Effort |
|----------|---------|--------|--------|
| 🔴 P0 | Hero | First impression — must look great | Low |
| 🔴 P0 | Navigation | Unusable if too small | Low |
| 🔴 P0 | About (01) | Core mission statement | Low |
| 🟡 P1 | Quote | Currently looks broken | Low |
| 🟡 P1 | Travel Cards (04) | Primary conversion section | Medium |
| 🟡 P1 | Blog/News (07) | Horizontal card layout is a big UX win | Medium |
| 🟡 P1 | Defined section | Hide broken parallax phrases | Low |
| 🟢 P2 | Partners (03) | Show descriptions by default | Low |
| 🟢 P2 | Get Inspired (05) | Taller images | Low |
| 🟢 P2 | Syria by Numbers (06) | Stat emphasis | Low |
| 🟢 P2 | Footer | Polish | Low |
| 🟢 P2 | Global spacing | Rhythm consistency | Medium |

---

## What NOT to Change

- **Webflow CDN CSS** — Don't touch the CDN link. All overrides via `styles.css`.
- **HTML structure** — No class additions, no new elements, no restructuring.
- **Desktop layout** — All changes scoped to `@media (max-width: 768px)`.
- **Color palette** — Keep the navy/gold/cream scheme. It's good.
- **Font choices** — Playfair Display + Inter is a strong pairing. Keep it.
- **Existing animations** — Swiper, Lenis scroll, GSAP — leave them running.

---

## How to Apply

1. Find the existing `@media (max-width: 768px)` block in `styles.css` (starts around line ~4530, the "GLOBAL MOBILE" section)
2. Either replace or append the CSS snippets above
3. Many of these override existing `!important` rules, so they should go **after** the existing mobile block
4. Test on iPhone Safari (most common mobile browser for this demographic) and Chrome Android
5. Use Chrome DevTools → Device Mode → iPhone 14 Pro (393×852) for primary testing

---

## Design Reference Sites

These foundation mobile homepages exemplify the patterns recommended above:

1. **Ford Foundation** (fordfoundation.org) — Bold typography, generous whitespace, clear CTAs
2. **Aga Khan Development Network** (the.akdn) — Clean grid, strong imagery, sectional rhythm
3. **Getty** (getty.edu) — Minimal, refined, image-forward
4. **charity:water** (charitywater.org) — Impactful stats, clear hierarchy, emotional imagery
5. **Smithsonian** (smithsonianmag.com) — Editorial quality, strong mobile card layouts
