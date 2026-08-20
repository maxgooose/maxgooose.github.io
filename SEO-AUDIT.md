# SEO & Share-Readiness Audit — syrianmosaicfoundation.org

**Date:** 2026-08-20 · **Scope:** all 15 EN pages + 5 generated locales (~91 pages), GitHub Pages hosting
**Status:** every item marked ✅ was fixed in this pass and is in the working tree, ready to push.

---

## 1. Link previews in chats (Instagram DM / WhatsApp / iMessage / Messenger)

The #1 ask. When someone pastes the site URL into a chat, the preview comes from the `og:image` / `og:title` / `og:description` meta tags, fetched by Facebook's crawler (Instagram + WhatsApp use the same cache).

| Before | After |
|---|---|
| Homepage: unbranded 728 KB 1920×1290 mosque photo, served through a `www` redirect hop; wrong aspect ratio (1.49:1) so platforms cropped it unpredictably; heavy enough that WhatsApp could skip it entirely | ✅ Branded 1200×630 card (84 KB JPEG): mosaic-pin logo, name in Playfair, "Preserving Syria's heritage. Building its future.", mosaic tesserae strip — at `assets/images/og/smf-og-card.jpg` |
| 5 pages used the square logo PNG as `og:image` → rendered as a tiny letterboxed blob | ✅ All pages now serve the branded card |
| 6 pages had **no** `og:image` at all → bare gray link | ✅ Covered |
| Arabic pages shared the English-context photo | ✅ Arabic card (`smf-og-card-ar.jpg`, 74 KB) on all `/ar/` pages, swapped automatically by the build |
| News + Artifact Recovery | ✅ Kept their real editorial photos (synagogue visit, recovered artifacts) — now with apex URLs, width/height, and alt text |
| No `og:url`, `og:site_name`, `og:locale` anywhere; `twitter:card` on 1 of 15 pages | ✅ All injected site-wide (og:url/og:locale per page per locale via `build-i18n.js`; `twitter:card summary_large_image` + `twitter:site @SyrianMosaicFDN` everywhere) |

**⚠ The new preview will NOT appear until you do the post-deploy cache refresh (section 7).**

## 2. Favicons & identity

- **Before:** `/favicon.ico` → 404, no icon links at all (generic globe in every browser tab, ugly bookmark/home-screen icons). Booking-form pointed a 606 KB 1024px PNG at `rel="shortcut icon"` with a wrong MIME type.
- ✅ **After:** full suite generated from the mosaic-pin logo (auto-cropped): root `favicon.ico` (16/32/48), `assets/icons/favicon-16x16.png` + `favicon-32x32.png`, `apple-touch-icon.png` (180px on cream), `icon-192.png` + `icon-512.png`, `site.webmanifest`, `theme-color`. Linked with root-absolute paths on every page in all languages.

## 3. Canonical signals (the invisible domain bug)

Every canonical URL, hreflang tag, sitemap entry, and robots.txt line pointed at **`https://www.syrianmosaicfoundation.org/...`** — but the live site 301-redirects `www` → apex. Every signal the site sent about itself contradicted where it actually lives. Root cause: one constant in `build-i18n.js`.

✅ Fixed at the source (`SITE_URL`), regenerated everywhere:
- Canonicals + hreflang on ~90 pages → apex domain
- Homepage canonicals are now clean directory URLs (`/`, `/ar/`, …) instead of `/index.html` (which was a duplicate-content URL)
- `sitemap.xml` (85 URLs) + `robots.txt` → apex
- `shop.html` redirect stubs (root + 5 locales) → apex canonicals (the stubs themselves stay — that's the correct way to keep old /shop links from 404ing)
- Hardcoded `www` inside booking-form's schema block → apex

## 4. Metadata gaps

- ✅ Meta descriptions added to the 4 pages missing them (volunteer + 3 registration pages) — in English **and** translated into Arabic, Hebrew, Spanish, Italian, Dutch (`locales/pages/*.json`), so the generated locale pages are fully translated.
- ✅ Homepage title upgraded from "The Syrian Mosaic Foundation" to **"Syrian Mosaic Foundation — Preserving Syria's Heritage, Building Its Future"** (+5 translations). This is the headline Google shows.
- ✅ `og:title`/`og:description` filled on the 6 pages missing them (impact, media, partner-with-us, vendors, partners-support, recognition).
- ✅ Structured data: homepage now carries `NGO` + `WebSite` JSON-LD (logo, email, Damascus + Brooklyn locations, `sameAs` → Instagram/X/LinkedIn — feeds Google's knowledge panel). Booking-form's half-done `ContactPage` schema got an absolute URL.
- ✅ Custom branded `404.html` (GitHub Pages serves it automatically; before, visitors got GitHub's default error page).
- Left as-is deliberately: existing page titles/descriptions that already had working translations (changing the strings would have silently broken the AR/HE/ES/IT/NL versions); decorative icons with empty `alt=""` (that's correct accessibility practice).

## 5. Performance (page weight) — finding only, photos left untouched

Six referenced photos are raw camera files served at full resolution (up to 7008px wide):

| File | Size on the wire |
|---|---|
| religious-group-picture.JPG | 19.3 MB |
| discussion-picture.JPG | 11.3 MB |
| founder-with-minister-2.JPG | 8.5 MB |
| founder-looking-at-religious-text.JPG | 5.4 MB |
| minister-and-founder-image.JPG | 5.4 MB |
| tourist-hero.jpg | 2.5 MB |

A test re-encode showed the set could drop from 53.6 MB to 3.4 MB with no visible difference at web sizes — but **per Hamza's call the originals stay exactly as they are; nothing was changed** (files are byte-identical to before).
If mobile load times ever become a complaint, the no-compromise route is `srcset`: keep each original as the full-size source and add smaller *derivative copies alongside it* — browsers pick the right size per device, the originals are never modified, and anyone who opens the image full-size still gets the pristine file.
Already good: homepage promo video is `preload="none"` with a poster; Cloudflare Web Analytics is installed.

## 6. Not changed (guardrails honored)

- No visible change to any page — verified by rendering EN + AR homepages before/after.
- Media page layout untouched (head metadata only). The in-progress media redesign + Faces-of-Syria videos are parked in `git stash` (`git stash list` → "media redesign WIP (parked 2026-08-20)"); untracked videos still in `assets/videos/`, excluded from the commit.
- PNG hero/cutout images left untouched (no safe lossless tool on this machine).

## 7. Post-deploy runbook — DO THESE AFTER PUSHING

1. **Force the preview cache to refresh** (critical — chats will show the old mosque photo for up to ~30 days otherwise):
   - Go to **developers.facebook.com/tools/debug** → paste `https://syrianmosaicfoundation.org/` → **Scrape Again**. Repeat for `/ar/` and any page you share often. This covers Instagram DMs, Messenger, WhatsApp, and Facebook.
   - LinkedIn: **linkedin.com/post-inspector** → same drill.
   - X reads the og tags directly; new tweets pick up the card automatically.
   - Test by DMing yourself the link on IG.
2. **Google Search Console** (needs your Google account): verify the `syrianmosaicfoundation.org` property (DNS or HTML-file method) and submit `https://syrianmosaicfoundation.org/sitemap.xml`. Without this you're flying blind on search traffic and Google may take weeks to notice the canonical cleanup on its own.
3. Optional: Bing Webmaster Tools (imports from GSC in two clicks).

## 8. Worthwhile follow-ups (not done, in rough priority order)

1. **Per-page share cards** for News stories — reuse the card template with the story photo.
2. **`nawartu-logo.png` is a 1.7 MB partner logo** displayed at ~200px; other big referenced PNGs (`opera house.png` 2.7 MB, `Records inclu.png` 1.9 MB, `The ark at the Fr.png` 1.4 MB, `joe jajati beside syrian flag.png` 1.4 MB, `An Alley in the Jewis.png` 1.1 MB). Same rule as section 5: originals stay untouched — if addressed, do it with `srcset`/derivative copies, never by replacing the files.
3. ~15 MB of **unreferenced** images sit in `assets/images/` (old heroes, damascus-gate variants, `hijab-lady-picture.JPG`…) — delete after confirming nothing external hotlinks them.
4. Homepage has 3 `<h1>` tags — keep the hero as the only H1, demote the other two to H2 (needs a matching CSS check, cosmetic SEO).
5. A tiny RSS feed for the News page would let diaspora newsletters auto-syndicate updates.

## Build pipeline notes (for future edits)

- English root pages are the **source of truth**. `node build-i18n.js` regenerates `/ar /he /es /it /nl`, `sitemap.xml`, and `robots.txt` — run it after editing any EN page in `PAGES`, then commit everything.
- Any new user-visible EN string needs its translations added to `locales/pages/<page>.json` (keys: `en` + 5 locales), or locale pages will show English.
- `media.html` is EN-only and outside the build — its head is maintained by hand.
- The share cards live at `assets/images/og/`; the card design source (HTML) is in Claude's session scratchpad and reproducible on request.
