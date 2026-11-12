/* The question list scrolls independently. Only a question button can open an answer. */
(() => {
  'use strict';

  const start = () => {
    const root = document.documentElement;
    const section = document.getElementById('faq');
    const list = section?.querySelector('.faq-list');
    const sources = list ? [...list.querySelectorAll(':scope > details')] : [];
    if (!section || !list || !sources.length) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const originalHidden = sources.map(item => item.hidden);
    let enabled = false;
    let selectedIndex = -1;
    let viewportIndex = 0;
    let pending = false;

    const reel = document.createElement('div');
    reel.className = 'faq-reel';
    reel.hidden = true;
    reel.setAttribute('role', 'region');
    reel.setAttribute('aria-label', 'Explorar preguntas frecuentes');
    const instructions = document.createElement('p');
    instructions.className = 'sr-only';
    instructions.id = 'faq-reel-instructions';
    instructions.textContent = 'Desplaza esta lista para ver más preguntas. Pulsa una pregunta para abrir o cerrar su respuesta. Las flechas del teclado cambian el foco entre preguntas, sin abrirlas.';

    const track = document.createElement('div');
    track.className = 'faq-reel-track';
    track.tabIndex = 0;
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', `${sources.length} preguntas frecuentes`);
    track.setAttribute('aria-describedby', instructions.id);
    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const entries = sources.map((source, itemIndex) => {
      const summary = source.querySelector('summary');
      const question = summary?.textContent.trim() || `Pregunta ${itemIndex + 1}`;
      const row = document.createElement('article');
      row.className = 'faq-reel-row';
      row.setAttribute('role', 'listitem');
      const heading = document.createElement('h3');
      heading.className = 'faq-reel-question';
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `faq-reel-question-${itemIndex + 1}`;
      button.className = 'faq-reel-question-button';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', `faq-reel-answer-${itemIndex + 1}`);
      const number = document.createElement('span');
      number.className = 'faq-reel-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(itemIndex + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'faq-reel-label';
      label.textContent = question;
      const icon = document.createElement('span');
      icon.className = 'faq-reel-toggle-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';
      button.append(number, label, icon);
      heading.append(button);

      const answer = document.createElement('div');
      answer.className = 'faq-reel-answer';
      answer.id = `faq-reel-answer-${itemIndex + 1}`;
      answer.hidden = true;
      answer.tabIndex = 0;
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', button.id);
      // Keep the public source disclosures intact for the non-animated fallback.
      [...source.childNodes].filter(node => node !== summary).forEach(node => {
        const clone = node.cloneNode(true);
        if (clone.nodeType === Node.ELEMENT_NODE) {
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        }
        answer.append(clone);
      });
      row.append(heading, answer);
      track.append(row);
      button.addEventListener('click', () => toggleQuestion(itemIndex));
      return { row, button, answer, icon, question };
    });

    const controls = document.createElement('div');
    controls.className = 'faq-reel-controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'faq-reel-arrow';
    previous.setAttribute('aria-label', 'Ver preguntas anteriores');
    previous.innerHTML = '<span aria-hidden="true">↑</span>';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'faq-reel-arrow';
    next.setAttribute('aria-label', 'Ver más preguntas');
    next.innerHTML = '<span aria-hidden="true">↓</span>';
    const counter = document.createElement('span');
    counter.className = 'faq-reel-counter';
    counter.setAttribute('aria-hidden', 'true');
    const hint = document.createElement('span');
    hint.className = 'faq-reel-hint';
    hint.textContent = 'Haz clic para descubrir la respuesta';
    controls.append(previous, counter, next, hint);
    reel.append(instructions, track, controls, status);
    list.append(reel);

    const announceLayout = () => section.dispatchEvent(new CustomEvent('cedro:contentchange', { bubbles: true }));
    const scrollBehavior = () => motion.matches ? 'auto' : 'smooth';
    const maximumScroll = element => Math.max(0, element.scrollHeight - element.clientHeight);
    const canScroll = (element, direction) => element && maximumScroll(element) > 2
      && (direction > 0 ? element.scrollTop < maximumScroll(element) - 1 : element.scrollTop > 1);

    const update = () => {
      pending = false;
      if (!enabled || !track.clientHeight) return;
      reel.classList.toggle('faq-reel--compact', track.clientHeight < 330);
      const bounds = track.getBoundingClientRect();
      const visible = entries.map((entry, itemIndex) => ({ index: itemIndex, bounds: entry.row.getBoundingClientRect() }))
        .filter(item => item.bounds.bottom > bounds.top + 2 && item.bounds.top < bounds.bottom - 2);
      viewportIndex = visible[0]?.index || 0;
      const finalIndex = visible[visible.length - 1]?.index ?? viewportIndex;
      const format = value => String(value + 1).padStart(2, '0');
      counter.textContent = `${format(viewportIndex)}–${format(finalIndex)} / ${String(entries.length).padStart(2, '0')}`;
      previous.disabled = track.scrollTop <= 1;
      next.disabled = track.scrollTop >= maximumScroll(track) - 1;

      if (selectedIndex >= 0) {
        const entry = entries[selectedIndex];
        const rowStyle = getComputedStyle(entry.row);
        const padding = parseFloat(rowStyle.paddingTop) + parseFloat(rowStyle.paddingBottom);
        const collapsed = entries.filter((_, itemIndex) => itemIndex !== selectedIndex)
          .map(item => item.row.getBoundingClientRect().height).sort((a, b) => a - b);
        const typicalRow = collapsed[Math.floor(collapsed.length / 2)] || 60;
        // Reserve room for two other questions while a long answer stays readable locally.
        const available = track.clientHeight - typicalRow * 2 - entry.button.getBoundingClientRect().height - padding - 14;
        const answerHeight = `${Math.max(54, Math.min(190, available)).toFixed(1)}px`;
        if (reel.style.getPropertyValue('--faq-answer-height') !== answerHeight) reel.style.setProperty('--faq-answer-height', answerHeight);
      }
    };
    const requestUpdate = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };

    const revealRow = (entry, behavior = 'auto') => {
      const box = entry.row.getBoundingClientRect();
      const bounds = track.getBoundingClientRect();
      let top = track.scrollTop;
      if (box.top < bounds.top + 6) top += box.top - bounds.top - 6;
      else if (box.bottom > bounds.bottom - 6) top += Math.min(box.bottom - bounds.bottom + 6, box.top - bounds.top - 6);
      track.scrollTo({ top: Math.max(0, top), behavior });
    };

    function toggleQuestion(itemIndex) {
      if (!enabled) return;
      selectedIndex = selectedIndex === itemIndex ? -1 : itemIndex;
      entries.forEach((entry, entryIndex) => {
        const open = entryIndex === selectedIndex;
        entry.row.classList.toggle('is-selected', open);
        entry.button.setAttribute('aria-expanded', String(open));
        entry.answer.hidden = !open;
        entry.icon.textContent = open ? '−' : '+';
        if (open) entry.answer.scrollTop = 0;
      });
      status.textContent = selectedIndex < 0 ? 'Respuesta cerrada.' : `Respuesta abierta. ${entries[selectedIndex].question}`;
      update();
      if (selectedIndex >= 0) {
        const selectedEntry = entries[selectedIndex];
        requestAnimationFrame(() => {
          if (enabled && entries[selectedIndex] === selectedEntry) revealRow(selectedEntry, scrollBehavior());
        });
      }
      requestUpdate();
      announceLayout();
    }

    const shiftWindow = direction => {
      if (!enabled) return;
      track.scrollBy({ top: direction * Math.max(90, track.clientHeight * 0.65), behavior: scrollBehavior() });
    };
    previous.addEventListener('click', () => shiftWindow(-1));
    next.addEventListener('click', () => shiftWindow(1));
    track.addEventListener('scroll', requestUpdate, { passive: true });

    // A wheel over the widget belongs to this list, including at either boundary.
    // Moving the viewport and choosing an answer deliberately use separate state.
    reel.addEventListener('wheel', event => {
      if (!enabled || event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      event.stopPropagation();
      const amount = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientHeight : 1);
      const direction = Math.sign(amount);
      const answer = event.target.closest('.faq-reel-answer');
      if (answer && !answer.hidden && canScroll(answer, direction)) answer.scrollTop += amount;
      else track.scrollTop += amount;
      requestUpdate();
    }, { passive: false });

    track.addEventListener('keydown', event => {
      if (!enabled || event.ctrlKey || event.metaKey || event.altKey) return;
      const button = event.target.closest('.faq-reel-question-button');
      const buttonIndex = button ? entries.findIndex(entry => entry.button === button) : -1;
      if (buttonIndex >= 0 && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1
          : Math.max(0, Math.min(entries.length - 1, buttonIndex + (event.key === 'ArrowDown' ? 1 : -1)));
        entries[targetIndex].button.focus({ preventScroll: true });
        revealRow(entries[targetIndex]);
        return;
      }
      if (event.target.closest('button,a,input,textarea,select,[contenteditable="true"]')) return;
      if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      const answer = event.target.closest('.faq-reel-answer');
      const direction = ['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 1;
      const scroller = answer && canScroll(answer, direction) ? answer : track;
      if (event.key === 'Home' || event.key === 'End') {
        scroller.scrollTo({ top: event.key === 'Home' ? 0 : maximumScroll(scroller), behavior: scrollBehavior() });
      } else {
        const amount = event.key.startsWith('Arrow') ? 45 : scroller.clientHeight * 0.65;
        scroller.scrollBy({ top: direction * amount, behavior: scrollBehavior() });
      }
    });

    const syncAvailability = () => {
      const shouldEnable = root.classList.contains('scene-ready') && !motion.matches;
      if (shouldEnable === enabled) return;
      const focusWasInside = reel.contains(document.activeElement);
      enabled = shouldEnable;
      section.classList.toggle('faq-reel-enabled', enabled);
      reel.hidden = !enabled;
      sources.forEach((item, itemIndex) => { item.hidden = enabled || originalHidden[itemIndex]; });
      if (enabled) requestUpdate();
      else if (focusWasInside) {
        const targetIndex = selectedIndex >= 0 ? selectedIndex : viewportIndex;
        if (selectedIndex >= 0) sources[selectedIndex].open = true;
        sources[targetIndex].querySelector('summary')?.focus({ preventScroll: true });
      }
      announceLayout();
    };

    // Scene transitions never select a question or open an answer.
    section.addEventListener('cedro:sceneenter', requestUpdate);
    document.addEventListener('cedro:ready', syncAvailability);
    motion.addEventListener('change', syncAvailability);
    new MutationObserver(syncAvailability).observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', requestUpdate, { passive: true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(requestUpdate);
      observer.observe(track);
      entries.forEach(entry => observer.observe(entry.row));
    }
    syncAvailability();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
