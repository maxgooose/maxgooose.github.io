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
    var AUTO_OPEN_DELAY = 3000;
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
    var autoTimer = null;

    // Reading window.localStorage itself throws when site data is blocked, so the
    // store is resolved inside a try as well (not only getItem/setItem).
    function store(name) {
        try { return window[name] || null; } catch (e) { return null; }
    }
    function storageGet(name, key) {
        var s = store(name);
        if (!s) return null;
        try { return s.getItem(key); } catch (e) { return null; }
    }
    function storageSet(name, key, value) {
        var s = store(name);
        if (!s) return;
        try { s.setItem(key, value); } catch (e) { /* quota / private mode */ }
    }

    var alreadySignedUp = storageGet('localStorage', DONE_KEY) === '1';

    // ── Open / close ────────────────────────────────────────────────────────
    function open(auto) {
        if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
        storageSet('sessionStorage', SEEN_KEY, '1');
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
        // Auto-open: focus the dialog itself so phones don't raise the keyboard over
        // a sheet nobody has read yet. Click-open: go straight to the first field.
        var target = card;
        if (!success.hidden) target = success;
        else if (!auto) target = form.querySelector('input[name="firstName"]');
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
            if (active === first || !card.contains(active) || active === card) { e.preventDefault(); last.focus(); }
        } else if (active === last || !card.contains(active)) {
            e.preventDefault(); first.focus();
        }
    }

    // ── Success panel ───────────────────────────────────────────────────────
    function showSuccessPanel(firstName, email) {
        document.getElementById('ev-success-name').textContent = firstName ? ', ' + firstName : '';
        var mail = document.getElementById('ev-success-mail');
        if (email) {
            document.getElementById('ev-success-email').textContent = email;
            mail.hidden = false;
        } else {
            mail.hidden = true;
        }
        formWrap.hidden = true;
        success.hidden = false;
        card.setAttribute('aria-labelledby', 'ev-success-title');
        card.removeAttribute('aria-describedby');
    }

    function markSignedUp() {
        alreadySignedUp = true;
        storageSet('localStorage', DONE_KEY, '1');
        var longLabel = document.querySelector('.ev-bar__btn-long');
        var shortLabel = document.querySelector('.ev-bar__btn-short');
        if (longLabel) longLabel.textContent = "You're signed up · Add to calendar";
        if (shortLabel) shortLabel.textContent = 'Add to calendar';
    }

    // ── Form ────────────────────────────────────────────────────────────────
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate(d) {
        if (!d.firstName) return { field: 'firstName', message: 'Please enter your first name.' };
        if (!d.lastName) return { field: 'lastName', message: 'Please enter your last name.' };
        if (!EMAIL_RE.test(d.email)) return { field: 'email', message: 'Please enter a valid email address.' };
        return null;
    }

    function showError(message, field) {
        errorEl.textContent = message || GENERIC_ERROR;
        errorEl.hidden = false;
        if (errorEl.scrollIntoView) errorEl.scrollIntoView({ block: 'center' });
        var input = field && form[field] && form[field].setAttribute ? form[field] : null;
        if (input) {
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', 'ev-error');
            input.focus({ preventScroll: true });
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

    form.addEventListener('input', function (e) {
        if (e.target && e.target.removeAttribute) {
            e.target.removeAttribute('aria-invalid');
            e.target.removeAttribute('aria-describedby');
        }
        if (!errorEl.hidden) hideError();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        hideError();
        var honeypot = form.fax_ext ? form.fax_ext.value : '';
        var data = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            organization: form.organization.value.trim() || 'Individual',
            email: form.email.value.trim(),
            website: honeypot, // honeypot: always "" for humans
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
                markSignedUp();
                showSuccessPanel(data.firstName, data.email);
                success.focus({ preventScroll: true });
                form.reset();
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

    if (alreadySignedUp) {
        // Returning guest: the bar becomes a shortcut to the calendar file.
        markSignedUp();
        showSuccessPanel('');
    }

    if (wantsDeepLink()) {
        open(false);
    } else if (!alreadySignedUp && !storageGet('sessionStorage', SEEN_KEY)) {
        autoTimer = setTimeout(function () {
            autoTimer = null;
            open(true);
        }, AUTO_OPEN_DELAY);
    }

    window.addEventListener('hashchange', function () {
        if (wantsDeepLink()) open(false);
    });
})();
