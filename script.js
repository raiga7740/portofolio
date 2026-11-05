/* ===== Helpers ===== */
function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

document.addEventListener('DOMContentLoaded', function () {
  /* ===== Theme Setup ===== */
  const themeToggleBtn = $('#theme-toggle');

  function applyStoredTheme() {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', 'true');
      return true;
    } else if (stored === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', 'false');
      return true;
    }
    return false;
  }

  function setThemeFromSystem() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.remove('dark', 'light');
    themeToggleBtn && themeToggleBtn.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
  }

  if (!applyStoredTheme()) {
    setThemeFromSystem();
  }

  themeToggleBtn && themeToggleBtn.addEventListener('click', function () {
    const currentlyDark = document.body.classList.contains('dark') ||
      (!document.body.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const goingDark = !currentlyDark;
    document.body.classList.toggle('dark', goingDark);
    document.body.classList.toggle('light', !goingDark);
    localStorage.setItem('theme-mode', goingDark ? 'dark' : 'light');
    themeToggleBtn.setAttribute('aria-pressed', goingDark ? 'true' : 'false');
  });

  /* ===== Mobile Menu ===== */
  const menuBtn = $('#menu-toggle');
  const nav = $('.primary-nav');
  function toggleMenu() {
    if (!nav) return;
    const open = nav.classList.toggle('open');
    menuBtn && menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn && menuBtn.addEventListener('click', toggleMenu);
  $$('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('open')) toggleMenu();
    });
  });
  document.addEventListener('click', (e) => {
    if (!nav || !nav.classList.contains('open')) return;
    if (nav.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
    toggleMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) toggleMenu();
  });

  /* ===== Typing Effect ===== */
  function typingEffect(strings, targetSel, speed = 75, delayBetween = 1400) {
    const target = $(targetSel);
    if (!target || !strings || !strings.length) return;
    let strIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      const current = strings[strIndex];
      if (!deleting) {
        target.textContent = current.slice(0, charIndex++);
        if (charIndex <= current.length) {
          setTimeout(tick, speed);
        } else {
          deleting = true;
          setTimeout(tick, delayBetween);
        }
      } else {
        target.textContent = current.slice(0, charIndex--);
        if (charIndex >= 0) {
          setTimeout(tick, speed * 0.55);
        } else {
          deleting = false;
          strIndex = (strIndex + 1) % strings.length;
          setTimeout(tick, speed);
        }
      }
    }
    tick();
  }

  const typedStringsEls = $$('#typed-strings span');
  if (typedStringsEls.length) {
    const strings = typedStringsEls.map(e => e.textContent.trim()).filter(Boolean);
    typingEffect(strings, '#typed-output');
  }

  /* ===== Project Filter ===== */
  const filterBtns = $$('.filter-btn');
  const cards = $$('#projects-grid .card');
  function applyFilter(filter) {
    cards.forEach(card => {
      const cat = card.dataset.category || '';
      const show = (filter === 'all' || cat === filter);
      card.classList.toggle('is-hidden', !show);
    });
  }
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ===== ScrollSpy ===== */
  const sections = ['hero', 'about', 'projects', 'skills', 'journey', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$('[data-nav]');
  function onScrollSpy() {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    let currentId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos && (sec.offsetTop + sec.offsetHeight) > scrollPos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }
  window.addEventListener('scroll', onScrollSpy);
  window.addEventListener('load', onScrollSpy);

  /* ===== Contact Form with EmailJS & SVG Status Icons ===== */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#name') ? $('#name').value.trim() : '';
    const email = $('#email') ? $('#email').value.trim() : '';
    const message = $('#message') ? $('#message').value.trim() : '';

    if (!name || !email || !message) {
      if (formStatus) {
        formStatus.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Lengkapi semua field formulir.</span>
        `;
        formStatus.style.color = '#ef4444';
      }
      return;
    }

    if (formStatus) {
      formStatus.innerHTML = `
        <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Mengirim pesan...</span>
      `;
      formStatus.style.color = 'var(--primary)';
    }

    emailjs.send('service_ukns1un', 'template_569romm', {
      title: 'Contact from Portfolio Website',
      name: name,
      email: email,
      message: message
    }).then(() => {
      if (formStatus) {
        formStatus.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Pesan berhasil terkirim! Terima kasih.</span>
        `;
        formStatus.style.color = '#10b981';
      }
      contactForm.reset();
    }).catch(err => {
      console.error('EmailJS Error:', err);
      if (formStatus) {
        formStatus.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>Gagal mengirim pesan. Silakan coba lagi.</span>
        `;
        formStatus.style.color = '#ef4444';
      }
    });
  });

  /* ===== Copy Email Button with Clean SVG Check ===== */
  const copyEmailBtn = $('#copy-email-btn');
  const emailTextEl = $('#email-address-text');
  if (copyEmailBtn && emailTextEl) {
    const originalContent = copyEmailBtn.innerHTML;
    copyEmailBtn.addEventListener('click', () => {
      const email = emailTextEl.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        copyEmailBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Berhasil Disalin!</span>
        `;
        setTimeout(() => {
          copyEmailBtn.innerHTML = originalContent;
        }, 2200);
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }

  /* ===== Image Lightbox Modal ===== */
  const modal = $('#image-modal');
  const modalImg = $('#modal-img');
  const modalCaption = $('#modal-caption');
  const modalClose = $('#modal-close');

  function openModal(src, alt) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || 'Pratinjau Gambar';
    if (modalCaption) modalCaption.textContent = alt || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  $$('#projects-grid .card').forEach(card => {
    const media = card.querySelector('.card-media');
    const previewBtn = card.querySelector('.btn-card-preview');
    const img = card.querySelector('img');

    if (media && img) {
      media.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(img.src, img.alt);
      });
    }

    if (previewBtn && img) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(img.src, img.alt);
      });
    }
  });

  modalClose && modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
});

/* ===== Cursor Effect ===== */
(function cursorLineTrail() {
  const canvas = document.getElementById('cursor-line');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const points = [];
  const maxPoints = 35;
  let targetX = 0, targetY = 0;
  let drawX = 0, drawY = 0;
  const ease = 0.28;

  window.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function addPoint(x, y) {
    points.push({ x, y, life: 1 });
    if (points.length > maxPoints) points.shift();
  }

  function update() {
    drawX += (targetX - drawX) * ease;
    drawY += (targetY - drawY) * ease;
    addPoint(drawX, drawY);
    for (let p of points) p.life -= 0.025;
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].life <= 0) points.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    if (points.length < 2) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const grad = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
    grad.addColorStop(0, 'rgba(234, 88, 12, 0)');
    grad.addColorStop(1, 'rgba(234, 88, 12, 0.75)');
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }
  loop();
})();
