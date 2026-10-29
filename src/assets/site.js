// Mobile nav
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Forms: post to the configured endpoint (Kit or form handler). Until an endpoint
// is set in site.config.json, show a preview notice instead of submitting.
document.querySelectorAll('.js-form').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action');
    const done = (extra = '') => {
      form.innerHTML = `<p class="form-success">${form.dataset.success || 'Thank you.'}</p>${extra}`;
    };
    if (!action) {
      done('<p class="form-preview">Preview only: this form is not connected yet.</p>');
      return;
    }
    try {
      const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      done();
    } catch {
      form.submit();
    }
  });
});

// Contact tabs
const tabs = document.querySelectorAll('[role="tab"]');
function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
if (location.hash === '#associates') {
  const t = document.getElementById('tab-associates');
  if (t) selectTab(t);
}
