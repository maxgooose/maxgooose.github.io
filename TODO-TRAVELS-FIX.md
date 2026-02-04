# SMF Travels Page Fixes — TODO

## Part 1: Section 04 Travel Cards (index.html)
**Issue:** Charcoal-colored text ("10 Days", "12 Days", "8 Days" and card titles) is not visible on top of dark background images.
- [ ] Remove or restyle `.benefits_card_title.is-travel-p` (day counts) — make text white/light
- [ ] Ensure all card text (titles, captions) uses white or light colors on image cards
- [ ] Remove any price references if present (currently showing day counts only — confirm with Harb if "prices" means day counts or something else)

## Part 2: Video + Section 07 (index.html)
**Issue:** The video is clipped/cut down, and Section 07 (NEWS & UPDATES) cuts into it.
- [ ] Check video container styling — ensure full video is visible (not clipped by overflow/height)
- [ ] Adjust spacing between video section and Section 07 so they don't overlap
- [ ] Verify `syria-promo.mp4` plays correctly without being cut off

## Part 3: Travels Page White Space (travels.html)
**Issue:** Massive white space at the top of the page when you first open it.
- [ ] Remove/reduce the oversized hero section padding
- [ ] Rebuild the page layout to be more compact and normal
- [ ] Keep the partner cards, description, CTA, and footer — just eliminate the dead space
- [ ] Make it load content-first, not whitespace-first

## Execution Order
1. **Part 1 first** (simplest — CSS color fixes on index.html)
2. **Part 2 second** (video + section spacing on index.html)
3. **Part 3 last** (full travels.html rebuild — biggest change)

## Rules
- Push directly to `claude/switch-branch-WvuOD` branch
- Do NOT touch unrelated sections
- Preview each change before moving to next part
