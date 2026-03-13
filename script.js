/* ─────────────────────────────────────────────
   CODRIUM  —  Script
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
  '.service-card, .testimonial-card, .process__step, .about__card'
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
