/* Section cards: read long sections fully before the next card covers them. */
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('[data-stack-card]')].map((element, index) => ({
    element,
    anchor: document.querySelector(`[data-stack-anchor="${element.dataset.stackCard}"]`),
    height: 0,
    top: null,
    dim: null,
    index,
  }));
  if (cards.length < 2 || cards.some(card => !card.anchor)) return;

  let pending = false;
  let needsMeasure = true;
  let movingFocus = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const headerBottom = () => Math.max(0, header?.getBoundingClientRect().bottom || 0);

  cards.forEach(card => card.element.style.setProperty('--stack-order', card.index + 1));

  const render = () => {
    pending = false;
    const enabled = !motion.matches;
    root.classList.toggle('stack-ready', enabled);
    if (!enabled) {
      cards.forEach(card => {
        card.element.style.removeProperty('--stack-dim');
        card.dim = null;
      });
      return;
    }

    if (needsMeasure) {
      cards.forEach(card => { card.height = card.element.offsetHeight; });
      needsMeasure = false;
    }
    const inset = headerBottom() + (window.innerWidth > 700 ? 14 : 10);
    const bottom = window.innerHeight - (window.innerWidth > 700 ? 26 : 18);
    cards.forEach(card => {
      // A tall card scrolls to its final lines before it is held in the stack.
      const top = Math.min(inset, bottom - card.height);
      if (top !== card.top) {
        card.element.style.setProperty('--stack-top', `${top}px`);
        card.top = top;
      }
    });

    const bounds = cards.map(card => card.element.getBoundingClientRect());
    cards.forEach((card, index) => {
      const visibleBottom = Math.min(bottom, bounds[index].bottom);
      const overlap = bounds[index + 1]
        ? clamp((visibleBottom - bounds[index + 1].top) / Math.max(1, visibleBottom - inset))
        : 0;
      const dim = (overlap * 0.58).toFixed(3);
      if (dim !== card.dim) {
        card.element.style.setProperty('--stack-dim', dim);
        card.dim = dim;
      }
    });
  };

  const requestRender = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(render);
  };
  const measure = () => { needsMeasure = true; requestRender(); };
  const findCard = target => cards.find(card => card.element.contains(target));

  const naturalTop = (target, card) => {
    // The normal-flow anchor stays put while the card itself is sticky.
    const cardBounds = card.element.getBoundingClientRect();
    return card.anchor.getBoundingClientRect().top + window.scrollY
      + target.getBoundingClientRect().top - cardBounds.top;
  };

  const goTo = (target, { smooth = false, focus = false } = {}) => {
    const card = findCard(target);
    if (!card) return false;
    const levelBar = target.closest('.level') ? card.element.querySelector('.level-navigation') : null;
    const inset = headerBottom() + 18 + (levelBar?.offsetHeight || 0);
    const top = Math.max(0, naturalTop(target, card) - inset);
    if (focus) {
      movingFocus = true;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      movingFocus = false;
    }
    window.scrollTo({ top, behavior: smooth && !motion.matches ? 'smooth' : 'instant' });
    requestRender();
    return true;
  };

  const hashTarget = hash => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };

  document.addEventListener('click', event => {
    if (!root.classList.contains('stack-ready') || event.defaultPrevented || event.button !== 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.target === '_blank') return;
    const target = hashTarget(link.hash);
    if (!target || !findCard(target)) return;
    event.preventDefault();
    if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
    goTo(target, { smooth: true, focus: true });
  });

  // Keyboard users can return to a link in an earlier, covered card.
  document.addEventListener('focusin', event => {
    if (movingFocus || !root.classList.contains('stack-ready')) return;
    const target = event.target;
    if (!target.matches(':focus-visible')) return;
    const card = findCard(target);
    if (!card) return;
    const bounds = target.getBoundingClientRect();
    const covered = cards.slice(card.index + 1).some(next => {
      const nextBounds = next.element.getBoundingClientRect();
      return nextBounds.top < bounds.bottom && nextBounds.bottom > bounds.top;
    });
    if (covered || bounds.top < headerBottom() || bounds.bottom > window.innerHeight) {
      goTo(target);
    }
  });

  const restoreHash = () => {
    if (!root.classList.contains('stack-ready') || !window.location.hash) return;
    const target = hashTarget(window.location.hash);
    if (target) goTo(target);
  };
  window.addEventListener('popstate', restoreHash);
  window.addEventListener('hashchange', restoreHash);
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.visualViewport?.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  motion.addEventListener('change', measure);
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', measure));
  document.querySelectorAll('img[loading="lazy"]').forEach(image => image.addEventListener('load', measure, { once: true }));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    cards.forEach(card => observer.observe(card.element));
    if (header) observer.observe(header);
  }
  document.fonts?.ready.then(measure);
  render();
  if (window.location.hash) window.requestAnimationFrame(restoreHash);
})();
