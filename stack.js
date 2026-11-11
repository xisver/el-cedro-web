/* Viewport-sized chapters with reading areas and one scroll step per gesture. */
(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('[data-stack-card]')].map((element, index) => ({
    element, index, anchor: document.querySelector(`[data-stack-anchor="${element.dataset.stackCard}"]`),
  }));
  if (cards.length < 2 || cards.some(card => !card.anchor)) return;
  let pending = false, previousScene = -1, entryTarget = null, movingFocus = false, movingUntil = 0;
  let navigationIndex = null, viewportKey = '';
  let entrySource = 'navigation';
  let wheelAt = 0, wheelTotal = 0, gestureUsed = false, readingGesture = false, touch = null;
  const clamp = value => Math.max(0, Math.min(1, value));
  const enabled = () => root.classList.contains('scene-ready');
  const canUseScenes = () => !motion.matches && innerHeight >= 520;
  const inset = () => (header?.offsetHeight || 80) + (innerWidth <= 700 ? 8 : 14);
  const destination = card => Math.max(0, card.anchor.getBoundingClientRect().top + scrollY - inset());
  const currentIndex = () => {
    let index = 0;
    cards.forEach(card => { if (destination(card) <= scrollY + 4) index = card.index; });
    return index;
  };
  const findCard = target => cards.find(card => card.element.contains(target));
  const hashTarget = hash => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };
  cards.forEach(card => {
    card.element.style.setProperty('--stack-order', card.index + 1);
    const reading = card.element.querySelector(':scope > .wrap');
    if (reading && !card.element.matches('#niveles,#faq')) reading.dataset.sceneScroll = '';
  });
  document.querySelector('.hero')?.setAttribute('data-scene-scroll', '');

  const sizeScene = () => {
    const top = inset(), bottom = innerHeight - (innerWidth <= 700 ? 8 : 14);
    root.style.setProperty('--scene-top', `${top}px`);
    root.style.setProperty('--scene-height', `${Math.max(180, bottom - top)}px`);
  };
  const render = () => {
    pending = false;
    if (!enabled()) return;
    sizeScene();
    const top = inset(), bottom = innerHeight - (innerWidth <= 700 ? 8 : 14);
    const bounds = cards.map(card => card.element.getBoundingClientRect());
    cards.forEach((card, index) => {
      const progress = bounds[index + 1]
        ? clamp((Math.min(bottom, bounds[index].bottom) - bounds[index + 1].top) / Math.max(1, bottom - top)) : 0;
      card.element.style.setProperty('--stack-dim', (progress * 0.58).toFixed(3));
    });
    const index = currentIndex();
    if (index !== previousScene) {
      cards[index].element.dispatchEvent(new CustomEvent('cedro:sceneenter', {
        detail: { direction: index >= previousScene ? 1 : -1, targetId: index === navigationIndex ? entryTarget : null, source: index === navigationIndex ? entrySource : 'scroll' },
      }));
      previousScene = index;
      if (index === navigationIndex) entryTarget = null;
    }
  };
  const requestRender = () => { if (!pending) { pending = true; requestAnimationFrame(render); } };
  const goTo = (target, { smooth = true, focus = false, source = 'navigation' } = {}) => {
    const card = findCard(target);
    if (!card) return false;
    const level = target.closest('.level');
    entryTarget = level?.id || target.id || card.element.dataset.stackCard;
    entrySource = source;
    history.replaceState(null, '', `#${entryTarget}`);
    if (level) card.element.dispatchEvent(new CustomEvent('cedro:select-level', { detail: { id: level.id } }));
    if (focus) {
      movingFocus = true;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      movingFocus = false;
    }
    movingUntil = performance.now() + (smooth ? 650 : 0);
    navigationIndex = card.index;
    window.scrollTo({ top: destination(card), behavior: smooth ? 'smooth' : 'instant' });
    requestRender();
    return true;
  };
  const maximumScroll = () => Math.max(0, root.scrollHeight - innerHeight);
  const advance = (direction, source) => {
    const index = currentIndex(), card = cards[index];
    const aligned = Math.abs(scrollY - destination(card)) < 8;
    if (!aligned) {
      if (direction < 0) return goTo(card.element, { source: 'scroll' });
      if (index + 1 < cards.length) return goTo(cards[index + 1].element, { source: 'scroll' });
    }
    if (aligned) {
      const step = new CustomEvent('cedro:step', { cancelable: true, detail: { direction, source } });
      card.element.dispatchEvent(step);
      if (step.defaultPrevented) return true;
    }
    const next = cards[index + direction];
    if (next) return goTo(next.element, { source: 'scroll' });
    if (direction > 0 && scrollY < maximumScroll() - 2) {
      movingUntil = performance.now() + 650;
      window.scrollTo({ top: maximumScroll(), behavior: 'smooth' });
      return true;
    }
    return false;
  };
  const canRead = (element, direction) => {
    if (!element?.getBoundingClientRect().height || element.closest('[inert],[hidden]')) return false;
    if (!/(auto|scroll)/.test(getComputedStyle(element).overflowY) || element.scrollHeight <= element.clientHeight + 3) return false;
    return direction > 0 ? element.scrollTop < element.scrollHeight - element.clientHeight - 2 : element.scrollTop > 2;
  };
  const readingArea = (target, card, direction) => {
    for (let element = target; element && card.element.contains(element); element = element.parentElement) {
      if (canRead(element, direction)) return element;
    }
    return [...card.element.querySelectorAll('[data-scene-scroll]')].find(element => canRead(element, direction));
  };

  document.addEventListener('wheel', event => {
    if (!enabled() || event.defaultPrevented || event.ctrlKey || document.body.classList.contains('menu-open')
      || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !event.target.closest('main,footer,header')) return;
    const now = performance.now();
    if (now - wheelAt > 180) { gestureUsed = false; readingGesture = false; wheelTotal = 0; }
    wheelAt = now;
    if (now < movingUntil || gestureUsed) { event.preventDefault(); return; }
    const direction = Math.sign(event.deltaY);
    const amount = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const card = cards[currentIndex()];
    const scroller = Math.abs(scrollY - destination(card)) < 8 && readingArea(event.target, card, direction);
    if (scroller && now >= movingUntil) {
      event.preventDefault(); scroller.scrollTop += amount; readingGesture = true; return;
    }
    if (readingGesture) { event.preventDefault(); return; }
    if (direction > 0 && scrollY >= maximumScroll() - 2) return;
    event.preventDefault();
    wheelTotal += amount;
    if (Math.abs(wheelTotal) < 40) return;
    gestureUsed = true;
    advance(direction, 'wheel');
  }, { passive: false });

  document.addEventListener('touchstart', event => {
    if (enabled() && event.touches.length === 1 && event.target.closest('main,footer,header')) {
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, lastY: event.touches[0].clientY, target: event.target, used: false, reading: false };
    }
  }, { passive: true });
  document.addEventListener('touchmove', event => {
    if (!touch || !enabled() || event.touches.length !== 1 || document.body.classList.contains('menu-open')) return;
    const delta = touch.y - event.touches[0].clientY;
    const incremental = touch.lastY - event.touches[0].clientY;
    touch.lastY = event.touches[0].clientY;
    if (Math.abs(event.touches[0].clientX - touch.x) > Math.abs(delta)) return;
    if (event.cancelable) event.preventDefault();
    if (Math.abs(delta) < 12) return;
    const direction = Math.sign(delta), card = cards[currentIndex()];
    const scroller = Math.abs(scrollY - destination(card)) < 8 && readingArea(touch.target, card, direction);
    if (scroller && !touch.used) { scroller.scrollTop += incremental; touch.reading = true; return; }
    if (touch.reading || touch.used || performance.now() < movingUntil || Math.abs(delta) < 55) return;
    touch.used = true;
    advance(direction, 'touch');
  }, { passive: false });
  ['touchend', 'touchcancel'].forEach(name => document.addEventListener(name, () => { touch = null; }, { passive: true }));

  document.addEventListener('keydown', event => {
    if (!enabled() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey
      || document.body.classList.contains('menu-open') || event.target.closest('a,button,input,textarea,select,summary,[contenteditable="true"]')) return;
    const direction = ['PageDown', 'ArrowDown', ' '].includes(event.key) ? (event.shiftKey ? -1 : 1)
      : ['PageUp', 'ArrowUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const card = cards[currentIndex()], scroller = readingArea(event.target, card, direction);
    if (scroller) { scroller.scrollBy({ top: direction * scroller.clientHeight * 0.65, behavior: 'smooth' }); return; }
    if (performance.now() >= movingUntil) advance(direction, 'keyboard');
  });
  document.addEventListener('click', event => {
    if (!enabled() || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]'), target = link && hashTarget(link.hash);
    if (!target || !findCard(target)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    goTo(target, { focus: true });
  });
  document.addEventListener('focusin', event => {
    if (movingFocus || !enabled() || !event.target.matches(':focus-visible')) return;
    const card = findCard(event.target);
    if (card && card.index !== currentIndex()) goTo(event.target, { smooth: false });
  });
  const restoreHash = () => {
    if (!enabled() || !location.hash) return;
    const target = hashTarget(location.hash);
    if (target) goTo(target, { smooth: false });
  };
  const configure = () => {
    const ready = canUseScenes();
    history.scrollRestoration = ready ? 'manual' : 'auto';
    root.classList.toggle('scene-ready', ready);
    root.classList.toggle('stack-ready', ready);
    if (!ready) cards.forEach(card => card.element.style.removeProperty('--stack-dim'));
    render();
    document.dispatchEvent(new CustomEvent('cedro:ready', { detail: { enabled: ready } }));
    viewportKey = `${innerWidth}:${innerHeight}:${header?.offsetHeight || 80}`;
  };
  window.addEventListener('scroll', requestRender, { passive: true });
  const resize = () => {
    const key = `${innerWidth}:${innerHeight}:${header?.offsetHeight || 80}`;
    if (key === viewportKey) return;
    viewportKey = key;
    if (canUseScenes() !== enabled()) {
      configure();
      if (enabled()) requestAnimationFrame(restoreHash);
      return;
    }
    if (!enabled()) return;
    const index = performance.now() < movingUntil && navigationIndex !== null ? navigationIndex : Math.max(0, previousScene);
    const card = cards[index];
    const atEnd = scrollY >= maximumScroll() - 3;
    sizeScene();
    window.scrollTo({ top: atEnd ? maximumScroll() : destination(card), behavior: 'instant' });
    requestRender();
  };
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('popstate', restoreHash);
  window.addEventListener('hashchange', restoreHash);
  document.addEventListener('cedro:contentchange', requestRender);
  document.addEventListener('cedro:request-scene', event => {
    const target = document.getElementById(event.detail?.id);
    if (target && enabled()) goTo(target);
  });
  motion.addEventListener('change', configure);
  configure();
  if (location.hash) requestAnimationFrame(restoreHash);
})();
