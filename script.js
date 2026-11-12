/* El Cedro: progressive enhancement, without third-party libraries. */
(() => {
  'use strict';

  const init = () => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1000px)');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const themeButton = document.getElementById('theme-toggle');
    const menuButton = document.getElementById('menu-toggle');
    const navigation = document.getElementById('primary-navigation');
    const header = document.getElementById('site-header');
    const progress = document.getElementById('scroll-progress');
    const revealElements = [...document.querySelectorAll('[data-reveal]')];
    const parallaxElements = [...document.querySelectorAll('[data-parallax]')];
    const storageKey = 'cedro-theme';
    let explicitTheme = false;
    let framePending = false;
    let revealObserver;

    // Storage may be blocked in private browsing or embedded previews.
    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem(storageKey);
    } catch { /* The theme still works for this visit. */ }
    explicitTheme = savedTheme === 'light' || savedTheme === 'dark';

    const applyTheme = (theme) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      if (!themeButton) return;
      const dark = theme === 'dark';
      const action = dark ? 'Modo claro' : 'Modo oscuro';
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.setAttribute('aria-label', `Activar ${action.toLowerCase()}`);
      themeButton.title = `Activar ${action.toLowerCase()}`;
      const label = themeButton.querySelector('[data-theme-label]');
      if (label) label.textContent = action;
    };

    applyTheme(explicitTheme ? savedTheme : (systemTheme.matches ? 'dark' : 'light'));

    themeButton?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      explicitTheme = true;
      applyTheme(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch { /* Keep the user's choice for the current visit. */ }
    });

    systemTheme.addEventListener('change', (event) => {
      if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
    });

    // A choice made in another tab should remain consistent here as well.
    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return;
      explicitTheme = event.newValue === 'light' || event.newValue === 'dark';
      applyTheme(explicitTheme ? event.newValue : (systemTheme.matches ? 'dark' : 'light'));
    });

    const setMenu = (open, returnFocus = false) => {
      if (!menuButton || !navigation) return;
      const isOpen = Boolean(open && !desktop.matches);
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      navigation.inert = !desktop.matches && !isOpen;
      if (!desktop.matches && !isOpen) navigation.setAttribute('aria-hidden', 'true');
      else navigation.removeAttribute('aria-hidden');
      if (isOpen) navigation.querySelector('a[href]')?.focus({ preventScroll: true });
      if (returnFocus) menuButton.focus({ preventScroll: true });
    };

    if (menuButton && navigation) {
      setMenu(false);
      menuButton.addEventListener('click', () => {
        setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
      });
      navigation.addEventListener('click', (event) => {
        if (event.target.closest('a[href]')) setMenu(false);
      });
      document.addEventListener('pointerdown', (event) => {
        if (desktop.matches || !document.body.classList.contains('menu-open')) return;
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
          setMenu(false, true);
        }
      });
      document.addEventListener('focusin', (event) => {
        if (desktop.matches || !document.body.classList.contains('menu-open')) return;
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
      });
      root.classList.add('navigation-ready');
    }

    const revealAll = () => {
      revealObserver?.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
      root.classList.remove('reveal-ready');
    };

    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      revealAll();
    } else {
      try {
        revealObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
        revealElements.forEach((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.top < window.innerHeight && bounds.bottom > 0) {
            element.classList.add('is-visible');
          } else {
            revealObserver.observe(element);
          }
        });
        // Content remains visible until observers have been installed safely.
        root.classList.add('reveal-ready');
      } catch {
        revealAll();
      }
    }

    const getTarget = (anchor) => {
      const hash = anchor.hash || `#${anchor.dataset.section || anchor.dataset.levelLink || ''}`;
      if (!hash || hash === '#') return null;
      try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch { return null; }
    };

    const linkGroups = ['a[data-section]', 'a[data-level-link]'].map((selector) => {
      const records = new Map();
      document.querySelectorAll(selector).forEach((anchor) => {
        const target = getTarget(anchor);
        if (!target) return;
        if (!records.has(target)) records.set(target, []);
        records.get(target).push(anchor);
      });
      return [...records].map(([target, anchors]) => ({ target, anchors }));
    });

    const updateCurrentLinks = (records, threshold) => {
      if (!records.length) return;
      if (document.getElementById('niveles')?.classList.contains('level-curtains-ready') && records[0].anchors[0].hasAttribute('data-level-link')) return;
      let current = null;
      for (const record of records) {
        if (record.target.getBoundingClientRect().top <= threshold) current = record;
      }
      if (!current && records[0].target.getBoundingClientRect().top < window.innerHeight * 0.7) {
        current = records[0];
      }
      for (const record of records) {
        const active = record === current;
        for (const anchor of record.anchors) {
          anchor.classList.toggle('is-active', active);
          if (active) anchor.setAttribute('aria-current', 'location');
          else anchor.removeAttribute('aria-current');
        }
      }
    };

    const updateScroll = () => {
      framePending = false;
      const scrollTop = Math.max(0, window.scrollY);
      const pageHeight = Math.max(0, root.scrollHeight - window.innerHeight);
      if (progress) progress.style.transform = `scaleX(${pageHeight ? Math.min(1, scrollTop / pageHeight) : 0})`;
      header?.classList.toggle('is-scrolled', scrollTop > 16);
      const threshold = (header?.getBoundingClientRect().height || 80) + 84;
      linkGroups.forEach((records) => updateCurrentLinks(records, threshold));

      const allowParallax = desktop.matches && !motionPreference.matches;
      for (const element of parallaxElements) {
        let offset = 0;
        if (allowParallax) {
          const bounds = (element.parentElement || element).getBoundingClientRect();
          if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
            offset = Math.max(-24, Math.min(24, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.055));
          }
        }
        element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      }
    };

    const requestUpdate = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    window.addEventListener('load', requestUpdate, { once: true });
    window.addEventListener('hashchange', requestUpdate);
    desktop.addEventListener('change', () => { setMenu(false); requestUpdate(); });
    motionPreference.addEventListener('change', () => {
      if (motionPreference.matches) revealAll();
      requestUpdate();
    });

    // Recalculate progress after FAQ disclosure or lazy-loaded photographs change height.
    document.querySelectorAll('details').forEach((detail) => {
      detail.addEventListener('toggle', requestUpdate);
    });
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
      image.addEventListener('load', requestUpdate, { once: true });
    });
    updateScroll();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
