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

// Headlines reveal word by word (an <em> phrase moves as one piece)
document.querySelectorAll('main h1, main h2').forEach((h) => {
  let i = 0;
  const wrap = (node) => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.style.setProperty('--i', i++);
    inner.appendChild(node);
    w.appendChild(inner);
    return w;
  };
  [...h.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(document.createTextNode(part)));
      });
      h.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('tbc')) {
      const placeholder = document.createComment('');
      h.replaceChild(placeholder, node);
      h.replaceChild(wrap(node), placeholder);
    }
  });
  h.classList.add('words');
  io.observe(h);
});

// Gold spotlight that follows the cursor across cards
if (matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.card, .case, .platform, .steps li, .client-wall li').forEach((el) => {
    el.classList.add('spot');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Buttons lean towards the cursor
  if (!reduced) {
    document.querySelectorAll('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
}

// Gold scroll progress line, and hexagons that turn with the scroll
const progress = document.createElement('div');
progress.className = 'progress';
document.body.appendChild(progress);
let ticking = false;
const onFrame = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
  if (!reduced) {
    document.querySelectorAll('.hex-hero').forEach((hex) => {
      const top = hex.closest('section').offsetTop;
      const d = scrollY - top;
      hex.style.setProperty('--sy', `${d * 0.2}px`);
      hex.style.setProperty('--rot', `${d * 0.04}deg`);
    });
  }
  ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
onFrame();

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

// Hexagons: layers drift with the pointer, and each turns gently as its section scrolls
if (!reduced) {
  document.querySelectorAll('.hex-hero').forEach((hex) => {
    const layers = hex.querySelectorAll('[data-depth]');
    const section = hex.closest('section');
    section.addEventListener('pointermove', (e) => {
      const r = section.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => { l.style.transform = `translate(${x * l.dataset.depth}px, ${y * l.dataset.depth}px)`; });
    });
    section.addEventListener('pointerleave', () => layers.forEach((l) => { l.style.transform = ''; }));
  });
}

// 2027 handbook pop-up: opens from any [data-open-handbook] button, or once
// after 20s or 55% scroll. Dismissing it keeps it closed for 7 days.
const handbook = document.getElementById('handbook');
if (handbook && typeof handbook.showModal === 'function') {
  const KEY = 'ph-handbook-dismissed';
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const recentlyDismissed = () => {
    try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < WEEK; } catch { return false; }
  };
  const remember = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} };
  const open = () => { if (!handbook.open) handbook.showModal(); };
  document.querySelectorAll('[data-open-handbook]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  handbook.querySelectorAll('[data-close-handbook]').forEach((b) => b.addEventListener('click', () => handbook.close()));
  handbook.addEventListener('click', (e) => { if (e.target === handbook) handbook.close(); });
  handbook.addEventListener('close', remember);

  const auto = !location.pathname.startsWith('/contact') && !recentlyDismissed() && !new URLSearchParams(location.search).has('nopopup');
  if (auto) {
    let fired = false;
    const fire = () => { if (fired || recentlyDismissed()) return; fired = true; open(); };
    setTimeout(fire, 20000);
    addEventListener('scroll', () => {
      if (scrollY / (document.body.scrollHeight - innerHeight) > 0.55) fire();
    }, { passive: true });
  }
  if (location.hash === '#handbook') open();
}

// Voice tiles: play the vertical film inline once a file is set in data-video
document.querySelectorAll('.voice').forEach((tile) => {
  tile.addEventListener('click', () => {
    const src = tile.dataset.video;
    if (!src) {
      tile.classList.add('show-soon');
      setTimeout(() => tile.classList.remove('show-soon'), 1800);
      return;
    }
    if (tile.classList.contains('playing')) return;
    const v = Object.assign(document.createElement('video'), { src, controls: true, autoplay: true, playsInline: true });
    tile.appendChild(v);
    tile.classList.add('playing');
  });
});
