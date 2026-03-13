/* ─────────────────────────────────────────────
   AXIUMS  —  Script
───────────────────────────────────────────── */

/* ── Theme toggle ── */
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const storedTheme  = localStorage.getItem('theme');
const prefersDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;

html.dataset.theme = storedTheme || (prefersDark ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('theme', next);
});

/* ── Nav: scroll shadow ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile Drawer ── */
const burger        = document.getElementById('burger');
const drawer        = document.getElementById('drawer');
const drawerClose   = document.getElementById('drawerClose');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer  () { drawer.classList.add('open'); drawerOverlay.classList.add('show'); }
function closeDrawer () { drawer.classList.remove('open'); drawerOverlay.classList.remove('show'); }

burger.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

/* ── Smooth anchor scroll (with nav offset) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Reveal on scroll ── */
const revealEls = document.querySelectorAll(
  '.service-card, .product-card, .testimonial-card, .process__step, .about__card, .stat'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Animated stat counters ── */
function animateCounter(el, target) {
  const duration = 1800;
  const start    = performance.now();
  const update   = now => {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const statsSection = document.querySelector('.hero__stats');
let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat__num[data-target]').forEach(el => {
      animateCounter(el, +el.dataset.target);
    });
  }
}, { threshold: 0.5 });

if (statsSection) counterObserver.observe(statsSection);

/* ── Product card hover tint ── */
document.querySelectorAll('.product-card').forEach(card => {
  const color = card.dataset.color;
  if (!color) return;
  const r = parseInt(color.slice(1,3), 16);
  const g = parseInt(color.slice(3,5), 16);
  const b = parseInt(color.slice(5,7), 16);

  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = `0 20px 50px rgba(${r},${g},${b},.2)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});

/* ── Contact form ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn      = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.disabled      = true;
    btn.textContent   = 'Sending…';
    btn.style.opacity = '.7';

    setTimeout(() => {
      btn.textContent        = '✓ Message sent!';
      btn.style.background   = 'linear-gradient(135deg, #34A853, #2d9148)';
      btn.style.opacity      = '1';
      form.reset();
      setTimeout(() => {
        btn.disabled       = false;
        btn.textContent    = original;
        btn.style.background = '';
      }, 3500);
    }, 1400);
  });
}

/* ── Cursor-following radial glow on hero ── */
const heroBg = document.querySelector('.hero__bg');
if (heroBg) {
  document.addEventListener('mousemove', e => {
    heroBg.style.setProperty('--mx', `${(e.clientX / window.innerWidth  * 100).toFixed(1)}%`);
    heroBg.style.setProperty('--my', `${(e.clientY / window.innerHeight * 100).toFixed(1)}%`);
  }, { passive: true });
}

/* ── Active nav link highlight ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const linkObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const link = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.style.color = '');
      link.style.color = 'var(--text-primary)';
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => linkObserver.observe(s));
