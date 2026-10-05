/**
 * event-signup.js — "Syria's Mosaic Heritage" (Thu, Oct 8, 2026 · Brooklyn, NY)
 * Announcement bar + sign-up modal on the homepage.
 *
 * Sign-ups POST to the smf-event-rsvp API (Vercel), which stores one record per
 * email in a private Vercel Blob store. The team reviews them at /api/attendees.
 * Everything here hides itself automatically once the event day is over.
 */
(function () {
    'use strict';

    var API = 'https://smf-event-rsvp.vercel.app/api/signup';
    var EVENT_END = Date.parse('2026-10-09T03:59:59Z'); // Oct 8, 2026, 11:59 PM New York time
    var AUTO_OPEN_DELAY = 1200;
    var SEEN_KEY = 'smf_ev_dura_seen'; // sessionStorage: auto-open once per visit
    var DONE_KEY = 'smf_ev_dura_rsvp'; // localStorage: this browser already signed up
    var GENERIC_ERROR = 'Something went wrong and your sign-up was not saved. Please try again, or email info@syrianmosaicfoundation.org.';

    var bar = document.getElementById('ev-bar');
    var modal = document.getElementById('ev-modal');
    if (!modal) return;

    // Event over: remove the promo entirely.
    if (Date.now() > EVENT_END) {
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        return;
    }

    var card = modal.querySelector('.ev-modal__card');
    var form = document.getElementById('ev-form');
    var formWrap = document.getElementById('ev-form-wrap');
    var success = document.getElementById('ev-success');
    var errorEl = document.getElementById('ev-error');
    var submitBtn = document.getElementById('ev-submit');
    var submitLabel = submitBtn ? submitBtn.textContent : '';
    var lastFocus = null;
    var isOpen = false;

    function storageGet(storage, key) {
        try { return storage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(storage, key, value) {
        try { storage.setItem(key, value); } catch (e) { /* private mode */ }
    }

    // ── Open / close ────────────────────────────────────────────────────────
    function open(auto) {
        if (isOpen) return;
        isOpen = true;
        lastFocus = document.activeElement;
        // animations.js checks this flag so the newsletter popup never stacks on top.
        window.SMF_EVENT_POPUP_SHOWN = true;
        modal.hidden = false;
        modal.setAttribute('data-auto', auto ? '1' : '0');
        document.documentElement.classList.add('ev-lock');
        if (window.lenis && typeof window.lenis.stop === 'function') window.lenis.stop();
        document.addEventListener('keydown', onKeydown);
        var target = success.hidden ? form.querySelector('input[name="firstName"]') : success;
        setTimeout(function () {
            if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
        }, 60);
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        modal.hidden = true;
        document.documentElement.classList.remove('ev-lock');
        if (window.lenis && typeof window.lenis.start === 'function') window.lenis.start();
        document.removeEventListener('keydown', onKeydown);
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
    }

    function onKeydown(e) {
        if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
        if (e.key === 'Tab') trapFocus(e);
    }

    function focusables() {
        var nodes = card.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), [tabindex="0"]');
        return Array.prototype.filter.call(nodes, function (el) { return el.offsetParent !== null; });
    }

    function trapFocus(e) {
        var els = focusables();
        if (!els.length) return;
        var first = els[0];
        var last = els[els.length - 1];
        var active = document.activeElement;
        if (e.shiftKey) {
            if (active === first || !card.contains(active)) { e.preventDefault(); last.focus(); }
        } else if (active === last || !card.contains(active)) {
            e.preventDefault(); first.focus();
        }
    }

    // ── Form ────────────────────────────────────────────────────────────────
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate(d) {
        if (!d.firstName) return { field: 'firstName', message: 'Please enter your first name.' };
        if (!d.lastName) return { field: 'lastName', message: 'Please enter your last name.' };
        if (!d.organization) return { field: 'organization', message: 'Please enter your organization, or write "Individual".' };
        if (!EMAIL_RE.test(d.email)) return { field: 'email', message: 'Please enter a valid email address.' };
        return null;
    }

    function showError(message, field) {
        errorEl.textContent = message || GENERIC_ERROR;
        errorEl.hidden = false;
        if (field && form[field]) {
            form[field].setAttribute('aria-invalid', 'true');
            form[field].focus({ preventScroll: true });
        }
    }

    function hideError() {
        errorEl.hidden = true;
        errorEl.textContent = '';
    }

    function setBusy(busy) {
        submitBtn.disabled = busy;
        submitBtn.textContent = busy ? 'Confirming…' : submitLabel;
        submitBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
    }

    function showSuccess(d, updated) {
        storageSet(localStorage, DONE_KEY, '1');
        document.getElementById('ev-success-name').textContent = d.firstName ? ', ' + d.firstName : '';
        document.getElementById('ev-success-email').textContent = d.email;
        document.getElementById('ev-success-note').hidden = !updated;
        buildCalendarLink();
        formWrap.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        form.reset();
    }

    form.addEventListener('input', function (e) {
        if (e.target && e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
        if (!errorEl.hidden) hideError();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        hideError();
        var data = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            organization: form.organization.value.trim(),
            email: form.email.value.trim(),
            website: form.website.value, // honeypot, stays empty for humans
            lang: document.documentElement.lang || 'en',
            page: window.location.pathname
        };
        var problem = validate(data);
        if (problem) { showError(problem.message, problem.field); return; }

        setBusy(true);
        var controller = window.AbortController ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

        fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller ? controller.signal : undefined
        }).then(function (res) {
            return res.json().then(
                function (json) { return { ok: res.ok, json: json || {} }; },
                function () { return { ok: false, json: {} }; }
            );
        }).then(function (r) {
            if (r.ok && r.json.ok) {
                showSuccess(data, r.json.status === 'updated');
            } else {
                showError(r.json.error || GENERIC_ERROR, r.json.field);
            }
        }).catch(function () {
            showError(GENERIC_ERROR);
        }).then(function () {
            if (timer) clearTimeout(timer);
            setBusy(false);
        });
    });

    // ── "Add to calendar" (.ics) ────────────────────────────────────────────
    function buildCalendarLink() {
        var link = document.getElementById('ev-ics');
        if (!link || link.getAttribute('data-ready')) return;
        var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        var lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Syrian Mosaic Foundation//Event Sign-up//EN',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            'UID:dura-europos-2026-10-08@syrianmosaicfoundation.org',
            'DTSTAMP:' + stamp,
            'DTSTART:20261008T223000Z', // 6:30 PM New York (EDT)
            'DTEND:20261009T010000Z',   // 9:00 PM New York (EDT)
            "SUMMARY:Syria's Mosaic Heritage — The Ancient Jewish Legacy of Dura-Europos",
            'LOCATION:Brooklyn\\, New York (exact address sent by email)',
            'DESCRIPTION:An evening with the Syrian Mosaic Foundation dedicated to preserving Syria\'s cultural heritage\\, with a special focus on its ancient Jewish history and the Synagogue of Dura-Europos. Live Syrian music. Glatt kosher refreshments. Questions: info@syrianmosaicfoundation.org',
            'URL:https://syrianmosaicfoundation.org/#rsvp',
            'END:VEVENT',
            'END:VCALENDAR'
        ];
        link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
        link.setAttribute('data-ready', '1');
    }

    // ── Wiring ──────────────────────────────────────────────────────────────
    Array.prototype.forEach.call(document.querySelectorAll('[data-ev-open]'), function (el) {
        el.addEventListener('click', function (e) { e.preventDefault(); open(false); });
    });
    Array.prototype.forEach.call(modal.querySelectorAll('[data-ev-close]'), function (el) {
        el.addEventListener('click', function (e) { e.preventDefault(); close(); });
    });

    function wantsDeepLink() {
        return /^#(rsvp|event|signup|sign-up)$/i.test(window.location.hash);
    }

    if (bar) bar.hidden = false;

    if (wantsDeepLink()) {
        open(false);
    } else if (!storageGet(localStorage, DONE_KEY) && !storageGet(sessionStorage, SEEN_KEY)) {
        storageSet(sessionStorage, SEEN_KEY, '1');
        setTimeout(function () { open(true); }, AUTO_OPEN_DELAY);
    }

    window.addEventListener('hashchange', function () {
        if (wantsDeepLink()) open(false);
    });
})();
