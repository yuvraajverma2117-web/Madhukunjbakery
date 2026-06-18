/* ============================================================
   Madhukunj — shared script
   Loaded on every page. Wires CONFIG, header/nav, smooth scroll
   (Lenis), reveal animations, and page-specific 3D scroll motion
   (guarded so pages without those elements just skip it).
   ============================================================ */

/* ------------------------------------------------------------
   EDIT ME: this is the only block you need to change anywhere
   on the site — phone numbers, WhatsApp, hours, address, maps,
   and the free-delivery note. Every page reads from here.
   ------------------------------------------------------------ */
const CONFIG = {
  phoneOrderDisplay: "+91 70370 50185",
  phoneOrderDial: "+917037050185",        // digits, country code, no spaces
  whatsapp: "917037050185",               // country code + number, no "+", no spaces
  whatsappText: "Hi Madhukunj, I'd like to order",
  phoneContact1: "+91 70370 50186",
  phoneContact2: "+91 70370 50187",
  hours: "Hours coming soon — please call to check today's timing",
  address: "Madhukunj, Bajna, Mathura, Uttar Pradesh, India",
  mapsQuery: "Madhukunj Bajna Mathura",
  freeDeliveryNote: "Free delivery in Bajna on orders above ₹200"
};
/* ------------------------------------------------------------ */

(function applyConfig(){
  const waHref = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(CONFIG.whatsappText);
  const mapsHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapsQuery);

  document.querySelectorAll('[data-call]').forEach(function(el){
    el.setAttribute('href', 'tel:' + CONFIG.phoneOrderDial);
  });
  document.querySelectorAll('[data-call-text]').forEach(function(el){
    el.textContent = CONFIG.phoneOrderDisplay;
  });
  document.querySelectorAll('[data-whatsapp]').forEach(function(el){
    el.setAttribute('href', waHref);
  });
  document.querySelectorAll('[data-maps]').forEach(function(el){
    el.setAttribute('href', mapsHref);
  });
  document.querySelectorAll('[data-hours]').forEach(function(el){
    el.textContent = CONFIG.hours;
  });
  document.querySelectorAll('[data-address]').forEach(function(el){
    el.textContent = CONFIG.address;
  });
  document.querySelectorAll('[data-contact1]').forEach(function(el){
    el.textContent = CONFIG.phoneContact1;
    el.setAttribute('href', 'tel:' + CONFIG.phoneContact1.replace(/\s/g, ''));
  });
  document.querySelectorAll('[data-contact2]').forEach(function(el){
    el.textContent = CONFIG.phoneContact2;
    el.setAttribute('href', 'tel:' + CONFIG.phoneContact2.replace(/\s/g, ''));
  });
  document.querySelectorAll('[data-free-delivery]').forEach(function(el){
    el.textContent = CONFIG.freeDeliveryNote;
  });
})();

document.querySelectorAll('[data-year]').forEach(function(el){
  el.textContent = new Date().getFullYear();
});

/* ---------------- Header: nav toggle + scroll state ---------------- */
const header = document.querySelector('.site-header');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', function(){
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (header) {
  const updateHeader = function(){
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

/* ---------------- Reduced motion / capability checks ---------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
const enableHeavy3D = !prefersReducedMotion;

/* ---------------- Smooth scrolling (Lenis) ---------------- */
let lenis = null;
if (!prefersReducedMotion && window.Lenis) {
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false
  });
  const raf = function(time){
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  if (window.gsap && window.gsap.ticker) {
    lenis.on('scroll', window.ScrollTrigger ? window.ScrollTrigger.update : function(){});
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------------- Reveal-on-scroll (calm, used everywhere) ---------------- */
(function initReveals(){
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }
  const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function(el){ observer.observe(el); });
})();

/* ---------------- Smooth in-page anchor scroll for category nav ---------------- */
document.querySelectorAll('a[href^="#"]').forEach(function(link){
  link.addEventListener('click', function(e){
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -90 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ---------------- GSAP 3D scroll motion (guarded per page) ---------------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  /* Drifting hexes — slow ambient layer, any page that has them */
  if (enableHeavy3D) {
    document.querySelectorAll('.drift-hex').forEach(function(hex, i){
      gsap.to(hex, {
        y: (i % 2 === 0 ? -1 : 1) * (40 + i * 10),
        x: (i % 2 === 0 ? 1 : -1) * (20 + i * 6),
        rotation: (i % 2 === 0 ? 1 : -1) * 25,
        ease: 'none',
        scrollTrigger: {
          trigger: hex.closest('section') || document.body,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* Home hero: hero dish floats + rotates in 3D as you scroll */
  const heroDish = document.querySelector('.hero-dish');
  if (heroDish) {
    gsap.set(heroDish.closest('.hero-stage'), { transformStyle: 'preserve-3d' });
    if (enableHeavy3D) {
      gsap.fromTo(heroDish,
        { y: -20, rotateY: -8, rotateX: 4 },
        {
          y: isSmallScreen ? 10 : 60,
          rotateY: isSmallScreen ? 4 : 16,
          rotateX: isSmallScreen ? -2 : -8,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        }
      );
      gsap.from(heroDish, { autoAlpha: 0, scale: 0.85, duration: 1.1, ease: 'power3.out', delay: 0.15 });
    }
  }

  /* Hero wordmark settle-in on load */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && enableHeavy3D) {
    gsap.from(heroContent, { autoAlpha: 0, y: 26, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  }

  /* Signature dishes: fly in from depth + slight rotation while scrolling past */
  const dishCards = document.querySelectorAll('.dish-band .dish-card');
  if (dishCards.length) {
    dishCards.forEach(function(card, i){
      const fromX = (i % 2 === 0) ? -120 : 120;
      if (enableHeavy3D) {
        gsap.fromTo(card,
          { autoAlpha: 0, x: fromX, z: -200, rotateY: (i % 2 === 0) ? -25 : 25 },
          {
            autoAlpha: 1, x: 0, z: 0, rotateY: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              end: 'top 55%',
              scrub: true
            }
          }
        );
      } else {
        gsap.set(card, { autoAlpha: 1 });
      }
    });
  }

  /* Cakes page: cake rotates in 3D as the page scrubs */
  const cake3d = document.querySelector('.cake-3d');
  if (cake3d) {
    gsap.set(cake3d.closest('.cakes-stage'), { transformStyle: 'preserve-3d' });
    if (enableHeavy3D) {
      gsap.fromTo(cake3d,
        { rotateY: -18, rotateX: 6, y: -10 },
        {
          rotateY: isSmallScreen ? 14 : 28,
          rotateX: isSmallScreen ? -4 : -10,
          y: isSmallScreen ? 10 : 40,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cakes-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        }
      );
      gsap.from(cake3d, { autoAlpha: 0, scale: 0.8, duration: 1, ease: 'power3.out', delay: 0.2 });
    }
  }

  /* Dish card subtle 3D tilt on hover (desktop, pointer-capable, motion allowed) */
  if (enableHeavy3D && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.hex-frame').forEach(function(frame){
      const card = frame.closest('.dish-card') || frame;
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', function(e){
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(frame, { rotateY: px * 14, rotateX: -py * 14, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function(){
        gsap.to(frame, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power3.out' });
      });
    });
  }
}

/* ---------------- Active category highlight on menu page ---------------- */
(function highlightCategoryNav(){
  const links = document.querySelectorAll('.category-nav a');
  if (!links.length) return;
  const sections = Array.from(links).map(function(link){
    return document.getElementById(link.getAttribute('href').slice(1));
  }).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      const link = document.querySelector('.category-nav a[href="#' + entry.target.id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function(l){ l.removeAttribute('data-active'); });
        link.setAttribute('data-active', 'true');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(function(section){ observer.observe(section); });
})();
