document.documentElement.classList.add('js');

// Mobile nav
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Scroll reveals and stat count-ups
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const target = Number(el.dataset.to);
  if (reduced) { el.textContent = target.toLocaleString('en-GB'); return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString('en-GB');
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-to]').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .stagger, .frame').forEach((el) => io.observe(el));

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

// Contact tabs, plus ?topic= preselects the enquiry type from CTAs elsewhere
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
const topic = new URLSearchParams(location.search).get('topic');
const topicSelect = document.querySelector('select[name="topic"]');
if (topic && topicSelect) {
  const opt = [...topicSelect.options].find((o) => o.value === topic);
  if (opt) topicSelect.value = topic;
}
