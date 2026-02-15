/**
 * i18n.js — Client-side language detection, auto-redirect, and selector persistence
 * Syrian Mosaic Foundation
 *
 * Behavior:
 * 1. On first visit, detect browser language and redirect to matching locale
 * 2. If user manually selects a language via the footer selector, save preference
 * 3. Saved preference always wins over auto-detection
 * 4. Highlight the current language in the footer selector
 */
(function () {
  'use strict';

  var SUPPORTED_LANGS = ['en', 'ar', 'he', 'es', 'it', 'nl'];
  var STORAGE_KEY = 'smf_lang_pref';
  var REDIRECTED_KEY = 'smf_lang_redirected';

  /**
   * Detect the current language from the URL path
   */
  function getCurrentLang() {
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && SUPPORTED_LANGS.indexOf(pathParts[0]) !== -1) {
      return pathParts[0];
    }
    return 'en';
  }

  /**
   * Get the current page filename
   */
  function getCurrentPage() {
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var currentLang = getCurrentLang();
    // Remove locale prefix if present
    if (currentLang !== 'en' && pathParts[0] === currentLang) {
      pathParts.shift();
    }
    return pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'index.html';
  }

  /**
   * Detect the user's preferred language from browser settings
   */
  function detectBrowserLang() {
    var browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
    for (var i = 0; i < browserLangs.length; i++) {
      var lang = browserLangs[i].toLowerCase().split('-')[0];
      if (SUPPORTED_LANGS.indexOf(lang) !== -1) {
        return lang;
      }
    }
    return 'en';
  }

  /**
   * Get saved language preference
   */
  function getSavedPref() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * Save language preference
   */
  function savePref(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Check if we've already auto-redirected in this session
   */
  function hasRedirected() {
    try {
      return sessionStorage.getItem(REDIRECTED_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  /**
   * Mark that we've auto-redirected
   */
  function markRedirected() {
    try {
      sessionStorage.setItem(REDIRECTED_KEY, '1');
    } catch (e) {
      // sessionStorage not available
    }
  }

  /**
   * Build URL for a given language and page
   */
  function buildUrl(lang, page) {
    if (lang === 'en') {
      return '/' + page;
    }
    return '/' + lang + '/' + page;
  }

  /**
   * Auto-redirect on first visit if appropriate
   */
  function autoRedirect() {
    var currentLang = getCurrentLang();
    var savedPref = getSavedPref();

    // If user has a saved preference and it differs from current, redirect
    if (savedPref && savedPref !== currentLang && SUPPORTED_LANGS.indexOf(savedPref) !== -1) {
      var page = getCurrentPage();
      window.location.replace(buildUrl(savedPref, page));
      return;
    }

    // If no saved pref and haven't auto-redirected yet, detect browser lang
    if (!savedPref && !hasRedirected()) {
      var detectedLang = detectBrowserLang();
      markRedirected();

      if (detectedLang !== currentLang && detectedLang !== 'en') {
        var page = getCurrentPage();
        window.location.replace(buildUrl(detectedLang, page));
        return;
      }
    }
  }

  /**
   * Set up the language selector click handlers
   */
  function initSelector() {
    var links = document.querySelectorAll('.lang-selector__options a[data-lang]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var lang = this.getAttribute('data-lang');
        if (lang) {
          savePref(lang);
          // Let the normal link navigation proceed
        }
      });
    }

    // Highlight current language
    var currentLang = getCurrentLang();
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-lang') === currentLang) {
        links[i].classList.add('lang-active');
      } else {
        links[i].classList.remove('lang-active');
      }
    }
  }

  // ── Run ──
  // Only auto-redirect if this is a normal page load (not a hash navigation)
  if (document.readyState === 'loading') {
    // Try to redirect before DOM is fully loaded for better UX
    autoRedirect();
    document.addEventListener('DOMContentLoaded', initSelector);
  } else {
    autoRedirect();
    initSelector();
  }
})();
