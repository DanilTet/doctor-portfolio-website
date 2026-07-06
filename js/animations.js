/**
 * Scroll Animations — Intersection Observer
 * Reveals elements with [data-animate] when they enter viewport
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
});

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    animatedElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px 80px 0px'
    }
  );

  animatedElements.forEach(el => observer.observe(el));
}
