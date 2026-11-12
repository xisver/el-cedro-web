/* Click-to-open academic curtains. Scrolling never chooses a level. */
(() => {
  'use strict';
  const section = document.getElementById('niveles');
  const navigation = section?.querySelector('.level-navigation');
  const panels = [...(section?.querySelectorAll('article.level') || [])];
  if (panels.length !== 5) return;
  const curtains = document.createElement('div');
  curtains.className = 'level-curtains';
  curtains.setAttribute('aria-label', 'Niveles educativos, abre una cortina para conocer el nivel');
  panels[0].before(curtains);
  const triggers = [];
  const copies = [];
  let selected = -1;

  panels.forEach((panel, index) => {
    const copy = panel.querySelector('.level-copy');
    const name = panel.querySelector('.pill').textContent.trim();
    const subtitle = panel.querySelector('.num')?.textContent.trim() || '';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = `curtain-toggle-${panel.id}`;
    trigger.className = 'curtain-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `curtain-content-${panel.id}`);
    trigger.setAttribute('aria-label', `Abrir ${name}`);
    const number = document.createElement('span');
    number.className = 'curtain-index'; number.textContent = `0${index + 1}`; number.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'curtain-label'; label.textContent = name;
    const note = document.createElement('span');
    note.className = 'curtain-subtitle'; note.textContent = subtitle;
    note.id = `curtain-subtitle-${panel.id}`;
    trigger.setAttribute('aria-describedby', note.id);
    const sign = document.createElement('span');
    sign.className = 'curtain-sign'; sign.textContent = '+'; sign.setAttribute('aria-hidden', 'true');
    trigger.append(number, label, note, sign);
    panel.prepend(trigger);
    panel.classList.add('level-curtain', 'is-visible');
    panel.removeAttribute('data-reveal');
    copy.id = `curtain-content-${panel.id}`;
    copy.setAttribute('role', 'region');
    copy.setAttribute('aria-label', `${name}: proyecto y talleres`);
    copy.dataset.sceneScroll = '';
    copy.tabIndex = 0;
    curtains.append(panel);
    triggers.push(trigger); copies.push(copy);
    trigger.addEventListener('click', () => select(selected === index ? -1 : index, true));
  });
  const banner = section.querySelector('.admission-banner');
  if (banner) copies[4].append(banner);
  if (navigation) navigation.hidden = true;
  section.classList.add('level-curtains-ready');

  function select(index, updateHash = false) {
    const focused = document.activeElement;
    const focusedCopy = copies.findIndex(copy => copy.contains(focused));
    selected = Math.max(-1, Math.min(panels.length - 1, index));
    section.dataset.levelIndex = selected;
    curtains.classList.toggle('has-open-curtain', selected >= 0);
    panels.forEach((panel, i) => {
      const open = i === selected;
      const name = panel.querySelector('.pill').textContent.trim();
      panel.classList.toggle('is-curtain-open', open);
      triggers[i].setAttribute('aria-expanded', String(open));
      triggers[i].setAttribute('aria-label', `${open ? 'Cerrar' : 'Abrir'} ${name}`);
      triggers[i].querySelector('.curtain-sign').textContent = open ? '−' : '+';
      copies[i].hidden = !open;
      copies[i].inert = !open;
      if (open) copies[i].scrollTop = 0;
    });
    if (focusedCopy >= 0 && focusedCopy !== selected) triggers[selected >= 0 ? selected : focusedCopy].focus({ preventScroll: true });
    if (updateHash) history.replaceState(null, '', selected >= 0 ? `#${panels[selected].id}` : '#niveles');
    document.dispatchEvent(new Event('cedro:contentchange'));
  }
  section.addEventListener('cedro:select-level', event => {
    const index = panels.findIndex(panel => panel.id === event.detail?.id);
    if (index >= 0) select(index);
  });
  section.addEventListener('cedro:sceneenter', event => {
    const index = panels.findIndex(panel => panel.id === event.detail?.targetId);
    if (index >= 0) select(index);
  });
  curtains.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected >= 0) {
      event.preventDefault();
      const index = selected;
      select(-1, true);
      triggers[index].focus({ preventScroll: true });
      return;
    }
    const index = triggers.indexOf(event.target);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { select(-1, true); return; }
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length;
    triggers[next].focus({ preventScroll: true });
  });
  select(-1);
})();
