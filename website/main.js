/* ═══════════════════════════════════════════════════
   SIAXEN — Main JS
   Navigation, Scroll Reveals, Animations
   ═══════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Mobile Nav Toggle ──
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  var header = document.querySelector('.site-header');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (header) header.classList.toggle('nav-open', isOpen);
    });

    // Close nav when clicking a link inside mobile nav
    var mobileLinks = mobileNav.querySelectorAll('a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', function() {
        mobileNav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (header) header.classList.remove('nav-open');
      });
    }
  }

  // ── Scroll Reveal ──
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:0.08, rootMargin:'0px 0px -40px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('is-visible'); });
  }

  // ── Header scroll state ──
  if (header) {
    window.addEventListener('scroll', function() {
      var y = window.scrollY;
      if (y > 50) {
        header.style.borderBottomColor = 'rgba(58,124,165,.12)';
      } else {
        header.style.borderBottomColor = '';
      }
    }, { passive:true });
  }

})();
