# Syrian Mosaic Foundation Website

## Architecture
- Webflow-exported pages: Use ima-aicha.webflow.shared CSS + jQuery + Webflow JS
- Custom pages: Use styles.css + animations.js + Lenis
- Target navbar: Webflow "nav-header" style from media.html

## Logo
- ALWAYS use: assets/images/smf-logo.png
- NEVER use: smf-logo-new.png, logo.jpg, logo.jpeg

## Navbar Standard (from media.html)
- Structure: .nav-header > .contact-overlay + nav.navbar > .burger-menu + .menu-container
- Links: Home(index.html), Travels(travels.html), The Syrian Mosaic(media.html), About(about.html), Contact(#/overlay), BOOK NOW(booking-form.html)
- Contact uses overlay with id="contact-overlay" + id="nav-contact-trigger" + id="close-overlay"
- Requires: Webflow CSS, jQuery, Webflow JS, animations.js (for contact overlay on custom pages)

## Color Scheme
- Navy: #1A3A52
- Gold: #D4A574
- Dark BG: #0B1A2A

## Contact Info
- Address: Damascus, Syria & New York, USA
- Phone: +1 347-893-3032
- Email: info@syrianmosaicfoundation.org
- Instagram: SyrianMosaicFoundation
- LinkedIn: syrian-mosaic-foundation
- X/Twitter: SyrianMosaicFDN

## SVGs
- **Inline SVGs** (index.html slider arrows, button arrows): icons only (paths), no text — no translation.
- **External SVGs**: Close overlay uses CDN pluss.svg as `<img alt="">` — no text. Syria/USA flags and syria-usa-emblem.svg are graphics only.
- **Syria flag image**: Use translation key `syrianFlagAlt` in volunteer, trip-registration, tourist-registration, delegation-registration locale JSON so `alt="Syrian Flag"` is translated (e.g. علم سوريا, Bandiera siriana).
- **syria-map.svg / syria-about-bg.svg**: Contain `<path title="...">` governorate names (e.g. Al Ḩasakah, Dimashq). Used as CSS background (syria-about-bg); map titles are not in DOM for locale build. Optional: per-locale SVG copies if governorate labels need translating.
