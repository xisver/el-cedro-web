/* FAQ scene: native disclosures remain the fallback when scene navigation is off. */
(() => {
  'use strict';

  const start = () => {
    const root = document.documentElement;
    const section = document.getElementById('faq');
    const list = section?.querySelector('.faq-list');
    const sourceItems = list ? [...list.querySelectorAll(':scope > details')] : [];
    if (!section || !list || !sourceItems.length) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const originalHidden = sourceItems.map(item => item.hidden);
    let index = Math.max(0, sourceItems.findIndex(item => item.open));
    let enabled = false;
    let lockedUntil = 0;
    let measurePending = false;

    const reel = document.createElement('div');
    reel.className = 'faq-reel';
    reel.hidden = true;
    reel.setAttribute('role', 'region');
    reel.setAttribute('aria-roledescription', 'carrusel de preguntas');
    reel.setAttribute('aria-label', 'Preguntas frecuentes');

    const track = document.createElement('div');
    track.className = 'faq-reel-track';
    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');

    const entries = sourceItems.map((source, itemIndex) => {
      const summary = source.querySelector('summary');
      const question = summary?.textContent.trim() || `Pregunta ${itemIndex + 1}`;
      const card = document.createElement('article');
      card.className = 'faq-reel-card';
      card.setAttribute('aria-roledescription', 'pregunta');
      card.setAttribute('aria-label', `${itemIndex + 1} de ${sourceItems.length}`);

      const heading = document.createElement('h3');
      heading.className = 'faq-reel-question';
      heading.id = `faq-reel-question-${itemIndex + 1}`;
      heading.tabIndex = -1;
      const title = document.createElement('span');
      title.textContent = question;
      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'faq-reel-select';
      select.textContent = question;
      select.setAttribute('aria-label', `Mostrar pregunta ${itemIndex + 1}: ${question}`);
      select.setAttribute('aria-controls', `faq-reel-answer-${itemIndex + 1}`);
      heading.append(title, select);

      const answer = document.createElement('div');
      answer.className = 'faq-reel-answer';
      answer.id = `faq-reel-answer-${itemIndex + 1}`;
      answer.dataset.sceneScroll = '';
      answer.tabIndex = 0;
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', heading.id);
      // Clone only answer nodes. Original details and their open state stay untouched.
      [...source.childNodes].filter(node => node !== summary).forEach(node => {
        const clone = node.cloneNode(true);
        if (clone.nodeType === Node.ELEMENT_NODE) {
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        }
        answer.append(clone);
      });
      card.append(heading, answer);
      track.append(card);
      select.addEventListener('click', () => changeTo(itemIndex, { focusHeading: true }));
      return { card, heading, title, select, answer, question };
    });

    const controls = document.createElement('div');
    controls.className = 'faq-reel-controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'faq-reel-arrow';
    previous.setAttribute('aria-label', 'Pregunta anterior');
    previous.innerHTML = '<span aria-hidden="true">↑</span>';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'faq-reel-arrow';
    next.setAttribute('aria-label', 'Siguiente pregunta');
    next.innerHTML = '<span aria-hidden="true">↓</span>';
    const counter = document.createElement('span');
    counter.className = 'faq-reel-counter';
    counter.setAttribute('aria-hidden', 'true');
    const hint = document.createElement('span');
    hint.className = 'faq-reel-hint';
    hint.textContent = 'Desplázate para descubrir';
    controls.append(previous, counter, next, hint);
    reel.append(track, controls, status);
    list.append(reel);

    const announceChange = () => {
      section.dispatchEvent(new CustomEvent('cedro:contentchange', { bubbles: true }));
    };

    const measure = () => {
      measurePending = false;
      if (!enabled) return;
      const height = track.clientHeight;
      if (!height) return;
      const compact = height < 260;
      reel.classList.toggle('faq-reel--compact', compact);
      reel.style.setProperty('--faq-step', `${(height * 0.42).toFixed(1)}px`);
      reel.style.setProperty('--faq-card-height', `${Math.max(72, height - (compact ? 72 : height < 330 ? 105 : 152))}px`);
    };
    const requestMeasure = () => {
      if (measurePending) return;
      measurePending = true;
      requestAnimationFrame(measure);
    };

    const render = ({ focusHeading = false, announce = true } = {}) => {
      const previouslyFocused = document.activeElement;
      const cardHadFocus = entries.some(entry => entry.card.contains(previouslyFocused));
      entries.forEach((entry, itemIndex) => {
        const distance = itemIndex - index;
        const current = distance === 0;
        const nearby = Math.abs(distance) <= 1;
        entry.card.classList.toggle('is-current', current);
        entry.card.classList.toggle('is-neighbor', !current && nearby);
        entry.card.classList.toggle('is-distant', !nearby);
        entry.card.style.setProperty('--faq-offset', Math.max(-2, Math.min(2, distance)));
        entry.card.style.setProperty('--faq-scale', current ? '1' : nearby ? '.78' : '.66');
        entry.card.style.setProperty('--faq-opacity', current ? '1' : nearby ? '.46' : '0');
        entry.card.inert = !nearby;
        entry.card.setAttribute('aria-hidden', String(!nearby));
        entry.title.hidden = !current;
        entry.select.hidden = current;
        entry.select.tabIndex = nearby && !current ? 0 : -1;
        entry.answer.hidden = !current;
      });
      previous.disabled = index === 0;
      next.disabled = index === entries.length - 1;
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(entries.length).padStart(2, '0')}`;
      if (announce) status.textContent = `Pregunta ${index + 1} de ${entries.length}. ${entries[index].question}`;

      // Moving a card never leaves keyboard focus inside an inert or hidden item.
      if (focusHeading || cardHadFocus || (previouslyFocused === next && next.disabled) || (previouslyFocused === previous && previous.disabled)) {
        entries[index].heading.focus({ preventScroll: true });
      }
      requestMeasure();
      announceChange();
    };

    function changeTo(nextIndex, options = {}) {
      if (!enabled || nextIndex < 0 || nextIndex >= entries.length || nextIndex === index) return false;
      index = nextIndex;
      lockedUntil = performance.now() + 380;
      entries[index].answer.scrollTop = 0;
      render(options);
      return true;
    }

    previous.addEventListener('click', () => changeTo(index - 1));
    next.addEventListener('click', () => changeTo(index + 1));

    section.addEventListener('cedro:step', event => {
      if (!enabled || !event.cancelable) return;
      const direction = Math.sign(Number(event.detail?.direction) || 0);
      if (!direction) return;
      // Swallow a gesture's remaining inertial ticks while its card is animating.
      if (performance.now() < lockedUntil) {
        event.preventDefault();
        return;
      }
      if (changeTo(index + direction)) event.preventDefault();
      // At either boundary the scene owner receives the unhandled direction.
    });

    section.addEventListener('cedro:sceneenter', event => {
      if (!enabled) return;
      const direction = Math.sign(Number(event.detail?.direction) || 0);
      const entryIndex = event.detail?.source === 'scroll' && direction < 0 ? entries.length - 1 : direction ? 0 : index;
      lockedUntil = 0;
      if (entryIndex !== index) {
        index = entryIndex;
        entries[index].answer.scrollTop = 0;
        render({ announce: false });
      } else requestMeasure();
    });

    const syncAvailability = () => {
      const shouldEnable = root.classList.contains('scene-ready') && !motion.matches;
      if (shouldEnable === enabled) return;
      const focusWasInReel = reel.contains(document.activeElement);
      enabled = shouldEnable;
      section.classList.toggle('faq-reel-enabled', enabled);
      reel.hidden = !enabled;
      sourceItems.forEach((item, itemIndex) => { item.hidden = enabled || originalHidden[itemIndex]; });
      if (enabled) render({ announce: false });
      else if (focusWasInReel) {
        sourceItems[index].open = true;
        sourceItems[index].querySelector('summary')?.focus({ preventScroll: true });
      }
      announceChange();
    };

    // Scene ownership can become ready after deferred scripts or change with motion settings.
    document.addEventListener('cedro:ready', syncAvailability);
    motion.addEventListener('change', syncAvailability);
    new MutationObserver(syncAvailability).observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', requestMeasure, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(requestMeasure).observe(track);
    syncAvailability();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
