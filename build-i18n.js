#!/usr/bin/env node
/**
 * build-i18n.js — Static multilingual site generator for Syrian Mosaic Foundation
 *
 * Reads English HTML source pages, applies translations from JSON locale files,
 * rewrites internal links, adjusts asset paths, injects hreflang tags + language
 * selector, handles RTL for Arabic/Hebrew, and writes output to /ar/, /he/, /es/,
 * /it/, /nl/ directories. Also patches English root pages with hreflang + selector.
 *
 * Usage:  node build-i18n.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ── Configuration ──────────────────────────────────────────────────────────────
const ROOT = __dirname;
const LOCALES = ['ar', 'he', 'es', 'it', 'nl'];
const ALL_LANGS = ['en', ...LOCALES];
const RTL_LANGS = ['ar', 'he'];

const PAGES = [
  'index.html',
  'booking-form.html',
  'volunteer.html',
  'trip-registration.html',
  'tourist-registration.html',
  'delegation-registration.html',
  'team.html',
  'shop.html',
  'impact.html',
  'artifact-recovery.html',
];

const SITE_URL = 'https://www.syrianmosaicfoundation.org';

// Internal pages whose href we rewrite in nav/footer links
const INTERNAL_PAGES = new Set(PAGES.map(p => p));

// ── Load translations ──────────────────────────────────────────────────────────
const common = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'common.json'), 'utf8'));

const pageTranslations = {};
for (const page of PAGES) {
  const key = page.replace('.html', '');
  const filePath = path.join(ROOT, 'locales', 'pages', `${key}.json`);
  if (fs.existsSync(filePath)) {
    pageTranslations[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Build the language selector HTML snippet */
function buildLanguageSelector(currentLang, currentPage) {
  const t = common[currentLang] || common['en'];
  const selectorLabel = t.languageSelector.label;

  let options = '';
  for (const lang of ALL_LANGS) {
    const label = t.languageSelector[lang];
    const href = lang === 'en'
      ? `/${currentPage}`
      : `/${lang}/${currentPage}`;
    const selected = lang === currentLang ? ' class="lang-active"' : '';
    options += `<a href="${href}"${selected} data-lang="${lang}">${label}</a>`;
  }

  return `
<div class="lang-selector" aria-label="${selectorLabel}">
  <span class="lang-selector__label">${selectorLabel}:</span>
  <div class="lang-selector__options">${options}</div>
</div>`;
}

/** Build hreflang link tags for a given page */
function buildHreflangTags(pageName) {
  let tags = '';
  for (const lang of ALL_LANGS) {
    const href = lang === 'en'
      ? `${SITE_URL}/${pageName}`
      : `${SITE_URL}/${lang}/${pageName}`;
    tags += `  <link rel="alternate" hreflang="${lang}" href="${href}"/>\n`;
  }
  // x-default points to English
  tags += `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/${pageName}"/>\n`;
  return tags;
}

/** Rewrite internal links to include locale prefix */
function rewriteLinks($, locale) {
  // Rewrite href attributes on <a> tags
  $('a[href]').each(function () {
    const href = $(this).attr('href');
    if (!href) return;
    // Skip external links, anchors, mailto, tel, javascript
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('javascript:')) return;
    // Skip asset links (images, css, js)
    if (href.startsWith('assets/') || href.startsWith('styles.css') || href.endsWith('.js') ||
        href.endsWith('.css') || href.endsWith('.json')) return;
    // For internal HTML pages, prepend locale
    if (INTERNAL_PAGES.has(href)) {
      if (locale === 'en') return; // English stays at root
      $(this).attr('href', `/${locale}/${href}`);
    }
  });
}

/** Fix asset paths for pages in subdirectories — prepend ../ */
function fixAssetPaths($, locale) {
  if (locale === 'en') return; // Root pages don't need path fixing

  // Fix src attributes
  $('[src]').each(function () {
    const src = $(this).attr('src');
    if (!src) return;
    // Only fix relative paths (not absolute/CDN)
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/') || src.startsWith('data:')) return;
    $(this).attr('src', `../${src}`);
  });

  // Fix href attributes on link/stylesheet tags
  $('link[href]').each(function () {
    const href = $(this).attr('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('/') || href.startsWith('data:')) return;
    $(this).attr('href', `../${href}`);
  });

  // Fix background-image in inline styles
  $('[style]').each(function () {
    const style = $(this).attr('style');
    if (!style || !style.includes('url(')) return;
    const fixed = style.replace(/url\(['"]?(?!https?:\/\/|\/\/|\/|data:)([^'")]+)['"]?\)/g, "url('../$1')");
    $(this).attr('style', fixed);
  });

  // Fix video source tags
  $('source[src]').each(function () {
    const src = $(this).attr('src');
    if (!src) return;
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/') || src.startsWith('data:')) return;
    $(this).attr('src', `../${src}`);
  });

  // Fix source srcset attributes (e.g. <picture> responsive images)
  $('source[srcset]').each(function () {
    const srcset = $(this).attr('srcset');
    if (!srcset) return;
    if (srcset.startsWith('http') || srcset.startsWith('//') || srcset.startsWith('/') || srcset.startsWith('data:')) return;
    $(this).attr('srcset', `../${srcset}`);
  });

  // Fix script src attributes for local scripts
  $('script[src]').each(function () {
    const src = $(this).attr('src');
    if (!src) return;
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/') || src.startsWith('data:')) return;
    $(this).attr('src', `../${src}`);
  });
}

/** Apply text translations to common elements (nav, footer, contact overlay) */
function translateCommon($, lang) {
  const t = common[lang];
  if (!t) return;

  // Nav link text
  const navTexts = {
    'Home': t.nav.home,
    'Shop': t.nav.shop,
    'Volunteer': t.nav.volunteer,
    'Contact': t.nav.contact,
    'GET INVOLVED': t.nav.getInvolved,
  };

  $('.nav-link-text').each(function () {
    const text = $(this).text().trim();
    if (navTexts[text]) {
      $(this).text(navTexts[text]);
    }
  });

  // Contact overlay
  const overlay = $('#contact-overlay');
  if (overlay.length) {
    overlay.find('.text-block-15').text(t.contactOverlay.title);
    const containers = overlay.find('.contact-container');
    containers.each(function () {
      const details = $(this).find('.contact-details');
      const label = details.first().text().trim();
      if (label === 'Address') {
        details.first().text(t.contactOverlay.address);
        details.filter('.is-link').first().text(t.contactOverlay.addressValue);
      } else if (label === 'Phone number') {
        details.first().text(t.contactOverlay.phone);
      } else if (label === 'Socials') {
        details.first().text(t.contactOverlay.socials);
      } else if (label === 'Email') {
        details.first().text(t.contactOverlay.email);
      }
    });
  }

  // Footer
  const footer = $('footer.travels-footer');
  if (footer.length) {
    footer.find('.travels-footer__tagline').text(t.footer.tagline);
    footer.find('.travels-footer__nav-heading').each(function () {
      const text = $(this).text().trim();
      if (text === 'Explore') $(this).text(t.footer.explore);
      else if (text === 'Connect') $(this).text(t.footer.connect);
      else if (text === 'Follow') $(this).text(t.footer.follow);
    });
    footer.find('.travels-footer__link').each(function () {
      const text = $(this).text().trim();
      if (text === 'Home') $(this).text(t.nav.home);
      else if (text === 'Shop') $(this).text(t.nav.shop);
      else if (text === 'Volunteer') $(this).text(t.nav.volunteer);
      else if (text === 'Book a Trip') $(this).text(t.footer.bookTrip);
      else if (text === 'Email Us') $(this).text(t.footer.emailUs);
    });
    footer.find('.travels-footer__copy').each(function () {
      const text = $(this).text().trim();
      if (text.includes('All rights reserved')) {
        $(this).html(t.footer.copyright);
      } else if (text.includes('Damascus')) {
        $(this).html(t.footer.location);
      }
    });
  }

  // Simple header for custom pages (volunteer, registration pages)
  const logoText = $('a.logo-text');
  if (logoText.length) {
    // Keep "Syrian Mosaic Foundation" as brand name in all languages
  }

  // Back link
  const backLink = $('a.back-link');
  if (backLink.length) {
    const backText = backLink.contents().filter(function() { return this.nodeType === 3; });
    // The back link text varies; we handle it in page-specific translations
  }
}

/**
 * HTML-level replacements for elements that contain inline markup (br, em, strong, span).
 * Maps CSS selector -> { en: 'english HTML', lang: 'translated HTML' }
 * This handles cases where text spans multiple DOM nodes and text-only replacement fails.
 */
const HTML_REPLACEMENTS = {
  'index.html': {
    '.smf-hero__title': {
      en: 'Preserving Syria\'s Heritage.<br>Building Its Future.',
      ar: 'الحفاظ على تراث سوريا.<br>بناء مستقبلها.',
      he: 'שימור המורשת של סוריה.<br>בניית עתידה.',
      es: 'Preservando el patrimonio de Siria.<br>Construyendo su futuro.',
      it: 'Preservare il patrimonio della Siria.<br>Costruire il suo futuro.',
      nl: 'Het erfgoed van Syrië bewaren.<br>De toekomst bouwen.',
    },
    '.smf-hero__subtitle': {
      en: '8+ years on the ground\u2002·\u2002Cultural preservation\u2002·\u2002Community development',
      ar: 'أكثر من 8 سنوات على أرض الواقع\u2002·\u2002الحفاظ على التراث الثقافي\u2002·\u2002التنمية المجتمعية',
      he: 'יותר מ-8 שנים בשטח\u2002·\u2002שימור תרבותי\u2002·\u2002פיתוח קהילתי',
      es: 'Más de 8 años en el terreno\u2002·\u2002Preservación cultural\u2002·\u2002Desarrollo comunitario',
      it: 'Oltre 8 anni sul campo\u2002·\u2002Conservazione culturale\u2002·\u2002Sviluppo comunitario',
      nl: 'Meer dan 8 jaar ter plaatse\u2002·\u2002Cultureel behoud\u2002·\u2002Gemeenschapsontwikkeling',
    },
    '.about-editorial__headline': {
      en: 'Seven Years on the Ground in <em>Syria</em>',
      ar: 'سبع سنوات على أرض الواقع في <em>سوريا</em>',
      he: 'שבע שנים בשטח ב<em>סוריה</em>',
      es: 'Siete años sobre el terreno en <em>Siria</em>',
      it: 'Sette anni sul campo in <em>Siria</em>',
      nl: 'Zeven jaar ter plaatse in <em>Syrië</em>',
    },
    // Section numbers with <br>
    '.slider-main_top-wrapper .sec-numb > div': {
      en: '01<br>OUR INITIATIVES',
      ar: '01<br>مبادراتنا',
      he: '01<br>היוזמות שלנו',
      es: '01<br>NUESTRAS INICIATIVAS',
      it: '01<br>LE NOSTRE INIZIATIVE',
      nl: '01<br>ONZE INITIATIEVEN',
    },
    '.section-title-and-text.is-03 .sec-numb > div': {
      en: '03<br>TRAVEL<br>PARTNERS',
      ar: '03<br>شركاء<br>السفر',
      he: '03<br>שותפי<br>נסיעות',
      es: '03<br>SOCIOS DE<br>VIAJE',
      it: '03<br>PARTNER DI<br>VIAGGIO',
      nl: '03<br>REIS<br>PARTNERS',
    },
    // Travel partners description with spans
    '.section-title-and-text.is-03 .home-heading': {
      en: 'We work with <span class="green-highlight">Syria\'s top travel operators</span> to bring you authentic cultural journeys. Our trusted partners offer immersive group and private tours\u2014from the ancient streets of <span class="green-highlight">Damascus</span> to the ruins of <span class="green-highlight">Palmyra</span> and beyond.',
      ar: 'نعمل مع <span class="green-highlight">أفضل منظمي الرحلات في سوريا</span> لتقديم رحلات ثقافية أصيلة لكم. يقدم شركاؤنا الموثوقون جولات جماعية وخاصة غامرة\u2014من شوارع <span class="green-highlight">دمشق</span> القديمة إلى أطلال <span class="green-highlight">تدمر</span> وما بعدها.',
      he: 'אנו עובדים עם <span class="green-highlight">מפעילי התיירות המובילים של סוריה</span> כדי להביא לכם מסעות תרבותיים אותנטיים. השותפים המהימנים שלנו מציעים סיורים קבוצתיים ופרטיים סוחפים\u2014מהרחובות העתיקים של <span class="green-highlight">דמשק</span> ועד חורבות <span class="green-highlight">פלמירה</span> ומעבר לכך.',
      es: 'Trabajamos con <span class="green-highlight">los mejores operadores turísticos de Siria</span> para ofrecerle viajes culturales auténticos. Nuestros socios de confianza ofrecen tours grupales y privados inmersivos\u2014desde las antiguas calles de <span class="green-highlight">Damasco</span> hasta las ruinas de <span class="green-highlight">Palmira</span> y más allá.',
      it: 'Lavoriamo con <span class="green-highlight">i migliori operatori turistici della Siria</span> per offrirvi viaggi culturali autentici. I nostri partner di fiducia offrono tour di gruppo e privati immersivi\u2014dalle antiche strade di <span class="green-highlight">Damasco</span> alle rovine di <span class="green-highlight">Palmira</span> e oltre.',
      nl: 'Wij werken samen met <span class="green-highlight">de beste reisoperators van Syrië</span> om u authentieke culturele reizen te bieden. Onze vertrouwde partners bieden meeslepende groeps- en privétours\u2014van de oude straten van <span class="green-highlight">Damascus</span> tot de ruïnes van <span class="green-highlight">Palmyra</span> en verder.',
    },
    // Our Partners description with spans + strong
    '.desti-cards-cnt .home-heading': {
      en: 'Our impact in <span class="green-highlight">Syria</span> is built on deep, trusted relationships\u2014with artisans, institutions, community leaders, and government officials who share our commitment to cultural renewal. At <strong>Syrian Mosaic Foundation</strong>, these partnerships are the foundation of every initiative we lead.',
      ar: 'تأثيرنا في <span class="green-highlight">سوريا</span> مبني على علاقات عميقة وموثوقة\u2014مع الحرفيين والمؤسسات وقادة المجتمع والمسؤولين الحكوميين الذين يشاركوننا التزامنا بالتجديد الثقافي. في <strong>مؤسسة الفسيفساء السورية</strong>، هذه الشراكات هي أساس كل مبادرة نقودها.',
      he: 'ההשפעה שלנו ב<span class="green-highlight">סוריה</span> בנויה על יחסים עמוקים ומהימנים\u2014עם אומנים, מוסדות, מנהיגים קהילתיים ופקידי ממשל החולקים את מחויבותנו לחידוש תרבותי. ב<strong>קרן הפסיפס הסורית</strong>, שותפויות אלה הן הבסיס לכל יוזמה שאנו מובילים.',
      es: 'Nuestro impacto en <span class="green-highlight">Siria</span> se basa en relaciones profundas y de confianza\u2014con artesanos, instituciones, líderes comunitarios y funcionarios gubernamentales que comparten nuestro compromiso con la renovación cultural. En la <strong>Fundación Mosaico Sirio</strong>, estas alianzas son la base de cada iniciativa que lideramos.',
      it: 'Il nostro impatto in <span class="green-highlight">Siria</span> è costruito su relazioni profonde e fidate\u2014con artigiani, istituzioni, leader comunitari e funzionari governativi che condividono il nostro impegno per il rinnovamento culturale. Alla <strong>Fondazione Mosaico Siriano</strong>, queste partnership sono il fondamento di ogni iniziativa che guidiamo.',
      nl: 'Onze impact in <span class="green-highlight">Syrië</span> is gebouwd op diepe, betrouwbare relaties\u2014met ambachtslieden, instellingen, gemeenschapsleiders en overheidsfunctionarissen die onze toewijding aan culturele vernieuwing delen. Bij de <strong>Syrian Mosaic Foundation</strong> vormen deze partnerschappen de basis van elk initiatief dat we leiden.',
    },
    // Section 04 OUR PARTNERS number
    '.desti-cards-cnt .section-title-and-text.is-03 .sec-numb > div': {
      en: '04<br>OUR PARTNERS',
      ar: '04<br>شركاؤنا',
      he: '04<br>השותפים שלנו',
      es: '04<br>NUESTROS SOCIOS',
      it: '04<br>I NOSTRI PARTNER',
      nl: '04<br>ONZE PARTNERS',
    },
    // Section 05 number
    '.section-title-and-text.is-03:last-of-type .sec-numb > div': {
      en: '05<br>SYRIA<br>BY NUMBERS',
      ar: '05<br>سوريا<br>بالأرقام',
      he: '05<br>סוריה<br>במספרים',
      es: '05<br>SIRIA<br>EN CIFRAS',
      it: '05<br>SIRIA<br>IN CIFRE',
      nl: '05<br>SYRIË<br>IN CIJFERS',
    },
    // Section 06 NEWS
    '.section-title-and-text.is-04 .sec-numb > div': {
      en: '06<br>NEWS &amp;<br>UPDATES',
      ar: '06<br>الأخبار<br>والتحديثات',
      he: '06<br>חדשות<br>ועדכונים',
      es: '06<br>NOTICIAS Y<br>ACTUALIZACIONES',
      it: '06<br>NOTIZIE E<br>AGGIORNAMENTI',
      nl: '06<br>NIEUWS &amp;<br>UPDATES',
    },
    // Section 07 NEWSLETTER
    '.newsletter-section .sec-numb > div': {
      en: '07<br>NEWSLETTER',
      ar: '07<br>النشرة<br>الإخبارية',
      he: '07<br>ניוזלטר',
      es: '07<br>BOLETÍN<br>INFORMATIVO',
      it: '07<br>NEWSLETTER',
      nl: '07<br>NIEUWSBRIEF',
    },
  },
  'team.html': {
    '.team-hero__title': {
      en: 'The Faces Behind<br>the <em>Mission</em>',
      ar: 'الوجوه وراء<br><em>المهمة</em>',
      he: 'הפנים מאחורי<br><em>המשימה</em>',
      es: 'Los rostros detrás de<br>la <em>Misión</em>',
      it: 'I volti dietro<br>la <em>Missione</em>',
      nl: 'De gezichten achter<br>de <em>Missie</em>',
    },
  },
  'shop.html': {
    // Met Museum footnote (contains <a> tag)
    'div[style*="text-align: center"] p': {
      en: 'Images courtesy of <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">The Metropolitan Museum of Art</a> (public domain, CC0). Items shown are representative of the types of antiques available through the Syrian Heritage Collection.',
      ar: 'الصور بإذن من <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">متحف المتروبوليتان للفنون</a> (ملكية عامة، CC0). القطع المعروضة تمثّل أنواع التحف المتاحة من خلال مجموعة التراث السوري.',
      he: 'תמונות באדיבות <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">מוזיאון המטרופוליטן לאמנות</a> (נחלת הכלל, CC0). הפריטים המוצגים מייצגים את סוגי העתיקות הזמינות דרך אוסף המורשת הסורית.',
      es: 'Imágenes cortesía de <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">The Metropolitan Museum of Art</a> (dominio público, CC0). Los artículos mostrados son representativos de los tipos de antigüedades disponibles a través de la Colección del Patrimonio Sirio.',
      it: 'Immagini per gentile concessione del <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">Metropolitan Museum of Art</a> (dominio pubblico, CC0). Gli articoli mostrati sono rappresentativi dei tipi di antichità disponibili attraverso la Collezione del Patrimonio Siriano.',
      nl: 'Afbeeldingen met dank aan <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" target="_blank" rel="noopener" style="color: #D4A574;">The Metropolitan Museum of Art</a> (publiek domein, CC0). De getoonde items zijn representatief voor de soorten antiek die beschikbaar zijn via de Syrische Erfgoedcollectie.',
    },
  },
  'impact.html': {
    '.hero-title': {
      en: 'Our Impact',
      ar: 'تأثيرنا',
      he: 'ההשפעה שלנו',
      es: 'Nuestro Impacto',
      it: 'Il Nostro Impatto',
      nl: 'Onze Impact',
    },
  },
  'artifact-recovery.html': {
    '.hero-title': {
      en: 'Recovering Stolen Artifacts in Damascus',
      ar: 'استعادة القطع الأثرية المسروقة في دمشق',
      he: 'שחזור ממצאים גנובים בדמשק',
      es: 'Recuperación de artefactos robados en Damasco',
      it: 'Recupero di manufatti rubati a Damasco',
      nl: 'Herstel van gestolen artefacten in Damascus',
    },
  },
};

/** Apply page-specific translations using a text replacement map */
function translatePage($, lang, pageName) {
  const pageKey = pageName.replace('.html', '');
  const translations = pageTranslations[pageKey];
  if (!translations || !translations[lang] || !translations['en']) return;

  const enStrings = translations['en'];
  const langStrings = translations[lang];

  // First, apply HTML-level replacements for elements with inline markup
  const htmlRepls = HTML_REPLACEMENTS[pageName];
  if (htmlRepls) {
    for (const selector of Object.keys(htmlRepls)) {
      const repl = htmlRepls[selector];
      if (!repl || !repl[lang]) continue;
      const el = $(selector);
      if (el.length) {
        el.html(repl[lang]);
      }
    }
  }

  // Build replacement map: English text -> translated text
  const replacements = {};
  for (const key of Object.keys(enStrings)) {
    if (langStrings[key] && enStrings[key] !== langStrings[key]) {
      replacements[enStrings[key]] = langStrings[key];
    }
  }

  // Sort by length (longest first) to avoid partial replacements
  const sortedEnglish = Object.keys(replacements).sort((a, b) => b.length - a.length);

  // Normalize Unicode spaces (en-space, em-space, non-breaking space) to regular space for matching
  function normalizeSpaces(str) {
    return str.replace(/[\u2002\u2003\u00A0\u200B]/g, ' ');
  }

  // Build a normalized replacement map for matching
  const normalizedReplacements = {};
  for (const en of sortedEnglish) {
    normalizedReplacements[normalizeSpaces(en)] = replacements[en];
  }
  const sortedNormalized = Object.keys(normalizedReplacements).sort((a, b) => b.length - a.length);

  // Replace text in all text nodes
  function replaceTextNodes(node) {
    if (!node || !node.children) return;

    node.children.forEach((child) => {
      if (child.type === 'text' && child.data) {
        let text = child.data;
        // Try exact match first
        for (const en of sortedEnglish) {
          if (text.includes(en)) {
            text = text.split(en).join(replacements[en]);
          }
        }
        // Try normalized match (handles Unicode spaces)
        let normalized = normalizeSpaces(text);
        for (const normEn of sortedNormalized) {
          if (normalized.includes(normEn)) {
            // Replace in the normalized text and apply back
            normalized = normalized.split(normEn).join(normalizedReplacements[normEn]);
          }
        }
        child.data = normalized;
      } else if (child.type === 'tag') {
        replaceTextNodes(child);
      }
    });
  }

  // Apply to body (and head for title/meta)
  replaceTextNodes($.root()[0]);

  // Also replace in <title> tag
  const title = $('title');
  if (title.length) {
    let titleText = title.text();
    for (const en of sortedEnglish) {
      if (titleText.includes(en)) {
        titleText = titleText.split(en).join(replacements[en]);
      }
    }
    title.text(titleText);
  }

  // Replace in meta description
  const metaDesc = $('meta[name="description"]');
  if (metaDesc.length) {
    let content = metaDesc.attr('content') || '';
    for (const en of sortedEnglish) {
      if (content.includes(en)) {
        content = content.split(en).join(replacements[en]);
      }
    }
    metaDesc.attr('content', content);
  }

  // Replace in OG meta tags
  $('meta[property^="og:"]').each(function () {
    let content = $(this).attr('content') || '';
    for (const en of sortedEnglish) {
      if (content.includes(en)) {
        content = content.split(en).join(replacements[en]);
      }
    }
    $(this).attr('content', content);
  });

  // Replace in Twitter meta tags
  $('meta[name^="twitter:"], meta[property^="twitter:"]').each(function () {
    let content = $(this).attr('content') || '';
    for (const en of sortedEnglish) {
      if (content.includes(en)) {
        content = content.split(en).join(replacements[en]);
      }
    }
    $(this).attr('content', content);
  });

  // Replace in placeholder attributes
  $('[placeholder]').each(function () {
    let ph = $(this).attr('placeholder') || '';
    for (const en of sortedEnglish) {
      if (ph.includes(en)) { ph = ph.split(en).join(replacements[en]); }
    }
    for (const normEn of sortedNormalized) {
      const normPh = normalizeSpaces(ph);
      if (normPh.includes(normEn)) { ph = normalizeSpaces(ph).split(normEn).join(normalizedReplacements[normEn]); }
    }
    $(this).attr('placeholder', ph);
  });

  // Replace in value attributes for submit buttons and hidden inputs
  $('input[type="submit"], input[type="hidden"]').each(function () {
    let val = $(this).attr('value') || '';
    for (const en of sortedEnglish) {
      if (val.includes(en)) { val = val.split(en).join(replacements[en]); }
    }
    $(this).attr('value', val);
  });

  // Replace in data-wait attributes
  $('[data-wait]').each(function () {
    let val = $(this).attr('data-wait') || '';
    for (const en of sortedEnglish) {
      if (val.includes(en)) { val = val.split(en).join(replacements[en]); }
    }
    $(this).attr('data-wait', val);
  });

  // Replace alt text on images
  $('[alt]').each(function () {
    let alt = $(this).attr('alt') || '';
    if (!alt || alt.length < 3) return;
    for (const en of sortedEnglish) {
      if (alt.includes(en)) { alt = alt.split(en).join(replacements[en]); }
    }
    $(this).attr('alt', alt);
  });

  // Replace select option text
  $('select option').each(function () {
    let text = $(this).text();
    for (const en of sortedEnglish) {
      if (text.includes(en)) { text = text.split(en).join(replacements[en]); }
    }
    $(this).text(text);
  });

  // Replace aria-label
  $('[aria-label]').each(function () {
    let val = $(this).attr('aria-label') || '';
    for (const en of sortedEnglish) {
      if (val.includes(en)) { val = val.split(en).join(replacements[en]); }
    }
    $(this).attr('aria-label', val);
  });

  // Replace data-name attributes (form field names shown in some contexts)
  $('[data-name]').each(function () {
    let val = $(this).attr('data-name') || '';
    for (const en of sortedEnglish) {
      if (val.includes(en)) { val = val.split(en).join(replacements[en]); }
    }
    $(this).attr('data-name', val);
  });

  // Replace data-success-text, data-duplicate-text, data-error-text (newsletter form)
  ['data-success-text', 'data-duplicate-text', 'data-error-text'].forEach(attr => {
    $(`[${attr}]`).each(function () {
      let val = $(this).attr(attr) || '';
      for (const en of sortedEnglish) {
        if (val.includes(en)) { val = val.split(en).join(replacements[en]); }
      }
      $(this).attr(attr, val);
    });
  });
}

/** Inject language selector into footer (removes existing to prevent duplication) */
function injectLanguageSelector($, lang, pageName) {
  // Remove any existing language selector to prevent duplication
  $('.lang-selector').remove();

  const selectorHtml = buildLanguageSelector(lang, pageName);

  // Try standard footer first
  const footer = $('footer.travels-footer');
  if (footer.length) {
    const bottom = footer.find('.travels-footer__bottom');
    if (bottom.length) {
      bottom.before(selectorHtml);
    } else {
      footer.find('.travels-footer__inner').append(selectorHtml);
    }
    return;
  }

  // Fallback: pages with simple <footer class="footer"> (e.g. volunteer.html)
  const simpleFooter = $('footer.footer');
  if (simpleFooter.length) {
    simpleFooter.before(selectorHtml);
    return;
  }

  // Last fallback: any <footer> tag
  const anyFooter = $('footer');
  if (anyFooter.length) {
    anyFooter.last().before(selectorHtml);
    return;
  }

  // Ultimate fallback: append to body
  $('body').append(selectorHtml);
}

/** Inject hreflang tags into <head> (removes existing ones first to prevent duplication) */
function injectHreflangTags($, pageName) {
  const head = $('head');
  if (!head.length) return;

  // Remove any existing hreflang tags to prevent duplication on re-runs
  head.find('link[rel="alternate"][hreflang]').remove();

  const tags = buildHreflangTags(pageName);
  const charset = head.find('meta[charset]');
  if (charset.length) {
    charset.after('\n' + tags);
  } else {
    head.prepend(tags);
  }
}

/** Inject canonical URL */
function injectCanonical($, lang, pageName) {
  const href = lang === 'en'
    ? `${SITE_URL}/${pageName}`
    : `${SITE_URL}/${lang}/${pageName}`;
  const head = $('head');
  if (head.length) {
    // Remove existing canonical if any
    head.find('link[rel="canonical"]').remove();
    head.append(`  <link rel="canonical" href="${href}"/>\n`);
  }
}

/** Set HTML lang and dir attributes */
function setLangDir($, lang) {
  const t = common[lang] || common['en'];
  $('html').attr('lang', t.lang);
  if (RTL_LANGS.includes(lang)) {
    $('html').attr('dir', 'rtl');
  } else {
    $('html').removeAttr('dir');
  }
}

/** Inject the i18n client script reference (prevents duplication) */
function injectI18nScript($, locale) {
  // Remove any existing i18n script references
  $('script[src*="i18n.js"]').remove();

  const scriptPath = locale === 'en' ? 'i18n.js' : '../i18n.js';
  $('head').append(`<script src="${scriptPath}"></script>\n`);
}

// ── Main Build ─────────────────────────────────────────────────────────────────

function build() {
  console.log('Building multilingual site...\n');

  // Create locale directories
  for (const locale of LOCALES) {
    const dir = path.join(ROOT, locale);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created directory: ${locale}/`);
    }
  }

  // Process each page
  for (const pageName of PAGES) {
    const sourcePath = path.join(ROOT, pageName);
    if (!fs.existsSync(sourcePath)) {
      console.log(`  SKIP ${pageName} (not found)`);
      continue;
    }

    const sourceHtml = fs.readFileSync(sourcePath, 'utf8');

    // ── Patch English page (add hreflang + selector + i18n script) ──
    {
      const $ = cheerio.load(sourceHtml, { decodeEntities: false });
      injectHreflangTags($, pageName);
      injectCanonical($, 'en', pageName);
      injectLanguageSelector($, 'en', pageName);
      injectI18nScript($, 'en');
      const output = $.html();
      fs.writeFileSync(sourcePath, output, 'utf8');
      console.log(`  ✓ Patched EN: ${pageName}`);
    }

    // ── Generate locale pages ──
    for (const locale of LOCALES) {
      const $ = cheerio.load(sourceHtml, { decodeEntities: false });

      // 1. Set lang + dir
      setLangDir($, locale);

      // 2. Translate common elements (nav, footer, contact)
      translateCommon($, locale);

      // 3. Translate page-specific content
      translatePage($, locale, pageName);

      // 4. Fix asset paths for subdirectory
      fixAssetPaths($, locale);

      // 5. Rewrite internal links
      rewriteLinks($, locale);

      // 6. Inject hreflang tags
      injectHreflangTags($, pageName);

      // 7. Inject canonical
      injectCanonical($, locale, pageName);

      // 8. Inject language selector
      injectLanguageSelector($, locale, pageName);

      // 9. Inject i18n client script
      injectI18nScript($, locale);

      // Write output
      const outPath = path.join(ROOT, locale, pageName);
      fs.writeFileSync(outPath, $.html(), 'utf8');
      console.log(`  ✓ Built ${locale}/${pageName}`);
    }
  }

  // ── Generate sitemap.xml ──
  generateSitemap();

  // ── Generate robots.txt ──
  generateRobotsTxt();

  console.log('\nBuild complete!');
  console.log(`  ${PAGES.length} pages × ${ALL_LANGS.length} languages = ${PAGES.length * ALL_LANGS.length} total files`);
}

function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const page of PAGES) {
    for (const lang of ALL_LANGS) {
      const loc = lang === 'en'
        ? `${SITE_URL}/${page}`
        : `${SITE_URL}/${lang}/${page}`;

      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;

      // Add xhtml:link alternates
      for (const altLang of ALL_LANGS) {
        const altHref = altLang === 'en'
          ? `${SITE_URL}/${page}`
          : `${SITE_URL}/${altLang}/${page}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altHref}"/>\n`;
      }
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${page}"/>\n`;
      xml += '  </url>\n';
    }
  }

  xml += '</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log('  ✓ Generated sitemap.xml');
}

function generateRobotsTxt() {
  const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), content, 'utf8');
  console.log('  ✓ Generated robots.txt');
}

// Run
build();
