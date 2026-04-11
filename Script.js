 const form = document.getElementById('contact-form');
  const btn  = document.getElementById('submit-btn');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending…';

    if (typeof gtag === 'function') {
      gtag('event', 'form_submit', { event_category: 'Contact', event_label: 'Contact Form' });
    }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        document.getElementById('form-wrap').style.display = 'none';
        document.getElementById('success').classList.add('show');
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