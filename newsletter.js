// SMF Newsletter Subscription Handler
(function() {
  const API_URL = 'https://skill-deploy-g80r4auu94-agent-skill-vercel.vercel.app/api/subscribe';

  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const statusEl = document.getElementById('newsletter-status');
  const btnText = form.querySelector('.smf-newsletter__btn-text');
  const btnLoading = form.querySelector('.smf-newsletter__btn-loading');
  const submitBtn = form.querySelector('.smf-newsletter__btn');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = form.querySelector('input[name="email"]').value.trim();
    const firstName = form.querySelector('input[name="firstName"]').value.trim();
    const lastName = form.querySelector('input[name="lastName"]').value.trim();

    if (!email) {
      showStatus('Please enter your email address.', 'error');
      return;
    }

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;
    statusEl.textContent = '';
    statusEl.className = 'smf-newsletter__status';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showStatus(data.message || 'Successfully subscribed! Check your email.', 'success');
        form.reset();
      } else {
        showStatus(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'smf-newsletter__status ' + type;
  }
})();
