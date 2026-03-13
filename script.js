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

/* ── Booking Modal ── */
// ⚠️ Replace these three values with your own from emailjs.com
const EMAILJS_PUBLIC_KEY  = 'bslzqiJBtGR0tj0Es';
const EMAILJS_SERVICE_ID  = 'service_464oryq';
const EMAILJS_TEMPLATE_ID = 'template_8psmwbl';
emailjs.init(EMAILJS_PUBLIC_KEY);
const SLOTS  = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let bState = { year: null, month: null, selectedDate: null };

function openBookingModal() {
  const now = new Date();
  bState = { year: now.getFullYear(), month: now.getMonth(), selectedDate: null };
  renderCalendar();
  document.getElementById('bookingRight').innerHTML = '';
  document.getElementById('bookingOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  document.getElementById('bookingOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCalendar() {
  document.getElementById('calMonthYear').textContent = `${MONTHS[bState.month]} ${bState.year}`;
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  const firstDay = new Date(bState.year, bState.month, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;
  const total    = new Date(bState.year, bState.month + 1, 0).getDate();
  const today    = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= total; d++) {
    const date    = new Date(bState.year, bState.month, d);
    const dayOfWeek = date.getDay();
    const dateStr = `${bState.year}-${String(bState.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const btn     = document.createElement('button');
    btn.className = 'cal-day';
    btn.textContent = d;

    if (date < today || dayOfWeek === 0 || dayOfWeek === 6) {
      btn.classList.add('cal-day--disabled');
      btn.disabled = true;
    } else {
      if (bState.selectedDate === dateStr) btn.classList.add('cal-day--selected');
      btn.addEventListener('click', () => {
        bState.selectedDate = dateStr;
        renderCalendar();
        renderSlots(dateStr, date);
      });
    }
    grid.appendChild(btn);
  }
}

function renderSlots(dateStr, dateObj) {
  const label = dateObj.toLocaleDateString('en-GB', { weekday:'long', month:'long', day:'numeric' });
  const right = document.getElementById('bookingRight');
  right.innerHTML = `<p class="booking-date-label">${label}</p><div class="booking-slots" id="bookingSlots"></div>`;

  SLOTS.forEach(slot => {
    const btn = document.createElement('button');
    btn.className = 'booking-slot';
    btn.textContent = slot;
    btn.addEventListener('click', () => renderForm(dateStr, slot, label));
    document.getElementById('bookingSlots').appendChild(btn);
  });
}

function renderForm(dateStr, time, label) {
  document.getElementById('bookingRight').innerHTML = `
    <p class="booking-date-label">${label} · ${time}</p>
    <form class="booking-form" id="bookingForm">
      <div class="form__group">
        <label>Your name</label>
        <input type="text" id="bName" placeholder="Jane Smith" required />
      </div>
      <div class="form__group">
        <label>Work email</label>
        <input type="email" id="bEmail" placeholder="jane@company.com" required />
      </div>
      <button type="submit" class="btn btn--primary btn--full">Confirm booking</button>
      <button type="button" id="bookingBack" class="btn btn--ghost btn--full" style="margin-top:.5rem">← Back to times</button>
    </form>`;

  document.getElementById('bookingForm').addEventListener('submit', e => {
    e.preventDefault();
    confirmBooking(document.getElementById('bName').value, document.getElementById('bEmail').value, dateStr, time, label);
  });
  document.getElementById('bookingBack').addEventListener('click', () => {
    renderSlots(dateStr, new Date(dateStr + 'T00:00:00'));
  });
}

function confirmBooking(name, email, dateStr, time, label) {
  const [y, mo, d] = dateStr.split('-');
  const [h, m]     = time.split(':');
  const start = `${y}${mo}${d}T${h}${m}00`;
  let eh = parseInt(h), em = parseInt(m) + 30;
  if (em >= 60) { eh += 1; em -= 60; }
  const end = `${y}${mo}${d}T${String(eh).padStart(2,'0')}${String(em).padStart(2,'0')}00`;

  const calTitle   = encodeURIComponent('Demo Call — Codrium');
  const calDetails = encodeURIComponent(`Booked by: ${name}\nEmail: ${email}\n\nWe look forward to speaking with you!`);
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${start}/${end}&details=${calDetails}`;

  const right = document.getElementById('bookingRight');
  right.innerHTML = `
    <div class="booking-confirmed">
      <div class="booking-confirmed__icon">⋯</div>
      <h4>Sending confirmation…</h4>
    </div>`;

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_name:      name,
    to_email:     email,
    booking_date: label,
    booking_time: time,
    calendar_url: calUrl,
  }).then(() => {
    right.innerHTML = `
      <div class="booking-confirmed">
        <div class="booking-confirmed__icon">✓</div>
        <h4>All set!</h4>
        <p>A confirmation email has been sent to <strong>${email}</strong> with a button to add the event to your Google Calendar.</p>
        <button class="btn btn--outline" id="bookingDone">Close</button>
      </div>`;
    document.getElementById('bookingDone').addEventListener('click', closeBookingModal);
  }).catch(() => {
    right.innerHTML = `
      <div class="booking-confirmed">
        <div class="booking-confirmed__icon" style="background:var(--red)">✕</div>
        <h4>Email failed</h4>
        <p>We couldn't send the confirmation email. <a href="${calUrl}" target="_blank" style="color:var(--blue)">Click here</a> to add the event to your calendar manually.</p>
        <button class="btn btn--outline" id="bookingDone">Close</button>
      </div>`;
    document.getElementById('bookingDone').addEventListener('click', closeBookingModal);
  });
}

if (document.getElementById('bookingOverlay')) {
  document.getElementById('bookingClose').addEventListener('click', closeBookingModal);
  document.getElementById('bookingOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('bookingOverlay')) closeBookingModal();
  });
  document.getElementById('calPrev').addEventListener('click', () => {
    if (bState.month === 0) { bState.month = 11; bState.year--; } else bState.month--;
    bState.selectedDate = null;
    renderCalendar();
    document.getElementById('bookingRight').innerHTML = '';
  });
  document.getElementById('calNext').addEventListener('click', () => {
    if (bState.month === 11) { bState.month = 0; bState.year++; } else bState.month++;
    bState.selectedDate = null;
    renderCalendar();
    document.getElementById('bookingRight').innerHTML = '';
  });
  document.querySelectorAll('.open-booking').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openBookingModal(); });
  });
}
