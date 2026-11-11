/* One academic level at a time; every original article remains available. */
(() => {
  'use strict';
  const root = document.documentElement;
  const section = document.getElementById('niveles');
  const navigation = section?.querySelector('.level-navigation');
  const panels = [...(section?.querySelectorAll('article.level') || [])];
  const tabs = [...(navigation?.querySelectorAll('[data-level-link]') || [])];
  if (panels.length !== 5 || tabs.length !== panels.length) return;
  const deck = document.createElement('div');
  deck.className = 'level-deck';
  panels[0].before(deck);
  panels.forEach(panel => {
    deck.append(panel);
    panel.querySelector('.level-copy').dataset.sceneScroll = '';
    panel.querySelector('.level-copy').tabIndex = 0;
  });
  const banner = section.querySelector('.admission-banner');
  const bannerParent = banner?.parentElement;
  const controls = document.createElement('div');
  controls.className = 'level-deck-controls';
  controls.innerHTML = '<button type="button" data-level-prev aria-label="Nivel anterior">↑</button><p><span data-level-count></span><span class="level-deck-hint">Desplaza para cambiar de nivel</span></p><button type="button" data-level-next aria-label="Nivel siguiente">↓</button>';
  deck.after(controls);
  const previous = controls.querySelector('[data-level-prev]');
  const next = controls.querySelector('[data-level-next]');
  const count = controls.querySelector('[data-level-count]');
  count.setAttribute('aria-live', 'polite');
  let active = 0, ready = false;

  const select = (index, { focus = false, updateHash = false } = {}) => {
    const focused = document.activeElement;
    const panelHadFocus = panels.some(panel => panel.contains(focused));
    const previousIndex = active;
    active = Math.max(0, Math.min(panels.length - 1, index));
    if (active !== previousIndex) panels[active].querySelector('.level-copy').scrollTop = 0;
    section.dataset.levelIndex = active;
    panels.forEach((panel, i) => {
      const selected = i === active;
      panel.classList.toggle('is-level-active', selected);
      panel.inert = ready && !selected;
      if (ready && !selected) panel.setAttribute('aria-hidden', 'true');
      else panel.removeAttribute('aria-hidden');
      if (ready) panel.setAttribute('role', 'tabpanel'); else panel.removeAttribute('role');
      tabs[i].classList.toggle('is-active', selected);
      if (ready) {
        tabs[i].setAttribute('role', 'tab');
        tabs[i].setAttribute('aria-selected', String(selected));
        tabs[i].setAttribute('aria-controls', panel.id);
        tabs[i].tabIndex = selected ? 0 : -1;
        if (selected) tabs[i].setAttribute('aria-current', 'location'); else tabs[i].removeAttribute('aria-current');
      } else {
        tabs[i].removeAttribute('role'); tabs[i].removeAttribute('aria-selected'); tabs[i].removeAttribute('aria-controls');
        tabs[i].removeAttribute('tabindex'); tabs[i].removeAttribute('aria-current');
      }
      // A hidden reveal observer must not leave the selected panel transparent.
      if (selected) panel.classList.add('is-visible');
    });
    previous.disabled = active === 0;
    next.disabled = active === panels.length - 1;
    count.textContent = `${String(active + 1).padStart(2, '0')} / 05 · ${tabs[active].textContent.replace(/^\s*\d+\s*/, '').trim()}`;
    if (updateHash) history.replaceState(null, '', `#${panels[active].id}`);
    if (focus || panelHadFocus || (focused === previous && previous.disabled) || (focused === next && next.disabled)) {
      tabs[active].focus({ preventScroll: true });
    }
    document.dispatchEvent(new Event('cedro:contentchange'));
  };
  const configure = () => {
    ready = root.classList.contains('scene-ready');
    section.classList.toggle('level-deck-ready', ready);
    if (ready) {
      navigation.setAttribute('role', 'tablist');
      navigation.setAttribute('aria-label', 'Seleccionar nivel educativo');
      if (banner) panels[4].querySelector('.level-copy').append(banner);
    } else {
      navigation.removeAttribute('role');
      navigation.setAttribute('aria-label', 'Explorar niveles');
      if (banner && bannerParent) bannerParent.append(banner);
    }
    select(active);
  };
  section.addEventListener('cedro:step', event => {
    if (!ready) return;
    const index = active + event.detail.direction;
    if (index < 0 || index >= panels.length) return;
    event.preventDefault();
    select(index, { updateHash: true });
  });
  section.addEventListener('cedro:select-level', event => {
    const index = panels.findIndex(panel => panel.id === event.detail.id);
    if (index >= 0) select(index);
  });
  section.addEventListener('cedro:sceneenter', event => {
    const requested = panels.findIndex(panel => panel.id === event.detail.targetId);
    select(requested >= 0 ? requested : event.detail.source === 'scroll' && event.detail.direction < 0 ? panels.length - 1 : 0);
  });
  navigation.addEventListener('keydown', event => {
    if (!ready || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : active + (event.key === 'ArrowLeft' ? -1 : 1);
    select(index, { focus: true, updateHash: true });
  });
  previous.addEventListener('click', () => select(active - 1, { updateHash: true }));
  next.addEventListener('click', () => select(active + 1, { updateHash: true }));
  document.addEventListener('cedro:ready', configure);
  configure();
})();
