const form = document.getElementById('contact-form');
const btn  = document.getElementById('submit-btn');

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  btn.disabled = true;
  btn.textContent = 'Sending…';

  // GA4 — track form submission
  if (typeof gtag === 'function') {
    gtag('event', 'form_submit', { event_category: 'Contact', event_label: 'Contact Form' });
  }

  // Get GA4 Tracking User ID from browser cookies
  function getTrackingUserId() {
    const gaCookie = document.cookie.split('; ').find(r => r.startsWith('_ga='));
    const clientId = gaCookie ? gaCookie.split('=')[1].split('.').slice(2).join('.') : '';
    const sessionCookie = document.cookie.split('; ').find(r => r.startsWith('_ga_Y6J3393Y80='));
    const sessionId = sessionCookie ? sessionCookie.split('=')[1].split('.')[2] : Date.now().toString();
    return `${clientId}:G-Y6J3393Y80`;
  }

  // Build Creatio payload
  const fullName  = document.getElementById('name').value.trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';

  const creatioPayload = {
    "FirstName":      firstName,
    "LastName":       lastName,
    "Email":          document.getElementById('email').value.trim(),
    "EntityName":     "FormSubmit",
    "TrackingUserId": getTrackingUserId(),
    "PageUrl":        window.location.href,
    "ReferrerUrl":    document.referrer || window.location.href
  };

  try {
    // Send to Formspree (stores responses)
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    // Send to Creatio webhook (links GA session to contact)
    await fetch('https://webhooks.creatio.com/webhooks/48820db2-0ad8-48bc-a965-4b227e82c257', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creatioPayload)
    });

    if (res.ok) {
      document.getElementById('form-wrap').style.display = 'none';
      document.getElementById('success').classList.add('show');

      // GA4 — track successful conversion
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', { event_category: 'Contact', event_label: 'Success' });
      }
    } else {
      btn.disabled = false;
      btn.textContent = 'Submit';
      alert('Something went wrong. Please try again.');
    }

  } catch {
    btn.disabled = false;
    btn.textContent = 'Submit';
    alert('Network error. Please try again.');
  }
});