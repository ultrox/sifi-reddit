// Apply during parsing, before the desktop viewport can be painted. A classic
// header or its width=1024 viewport identifies old Reddit; modern Reddit is left alone.
(() => {
  if (!matchMedia('(max-device-width: 800px)').matches) return;
  // Separate from the old forced-dark preference so upgrades default to System.
  const themeKey = 'sifi-reddit-theme-mode';
  const modes = ['system', 'light', 'dark'];
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const validMode = value => modes.includes(value) ? value : 'system';
  let mode = 'system';
  try { mode = validMode(localStorage.getItem(themeKey)); } catch {}
  const applyTheme = () => {
    const root = document.documentElement;
    root.dataset.sifiThemeMode = mode;
    root.dataset.sifiTheme = mode === 'system' ? (systemTheme.matches ? 'dark' : 'light') : mode;
    const header = document.querySelector('#header-bottom-right');
    if (!header) return;
    let toggle = document.getElementById('sifi-theme-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'sifi-theme-toggle';
      toggle.type = 'button';
      toggle.addEventListener('click', () => {
        mode = modes[(modes.indexOf(mode) + 1) % modes.length];
        try { localStorage.setItem(themeKey, mode); } catch {}
        applyTheme();
      });
      header.append(toggle);
    }
    const label = `Theme: ${mode[0].toUpperCase()}${mode.slice(1)}`;
    if (toggle.textContent !== label) toggle.textContent = label;
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    toggle.setAttribute('aria-label', `${label}. Switch to ${nextMode} mode`);
  };
  systemTheme.addEventListener('change', () => {
    if (mode === 'system' && document.documentElement.classList.contains('sifi-reddit-mobile')) applyTheme();
  });
  window.addEventListener('storage', event => {
    if (event.key !== themeKey || !document.documentElement.classList.contains('sifi-reddit-mobile')) return;
    mode = validMode(event.newValue);
    applyTheme();
  });
  const blockThemes = () => {
    if (!document.documentElement?.classList.contains('sifi-reddit-mobile')) return;
    for (const theme of document.querySelectorAll('link[title="applied_subreddit_stylesheet"]')) {
      // A link disabled before it loads can still acquire an enabled CSSStyleSheet.
      // A nonmatching media query also blocks the theme's eventual loaded sheet.
      if (theme.media !== 'not all') theme.media = 'not all';
      if (!theme.disabled) theme.disabled = true;
      if (theme.sheet && !theme.sheet.disabled) theme.sheet.disabled = true;
    }
  };
  const formatPreferenceOptions = () => {
    const controls = document.querySelectorAll('#pref-form input[type="radio"], #pref-form input[type="checkbox"]');
    for (const [index, control] of [...controls].entries()) {
      if (control.parentElement.classList.contains('sifi-pref-option')) continue;
      const label = control.nextElementSibling;
      if (label?.tagName !== 'LABEL') continue;
      const separator = label.nextElementSibling;
      const option = document.createElement('div');
      option.className = 'sifi-pref-option';
      control.before(option);
      option.append(control, label);
      // Some native checkboxes have a name but no id, breaking label association.
      if (!control.id) control.id = `sifi-pref-option-${index}`;
      label.htmlFor = control.id;
      if (separator?.tagName === 'BR') separator.remove();
    }
  };
  const initialize = () => {
    const root = document.documentElement;
    if (!root) return;
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!root.classList.contains('sifi-reddit-mobile')) {
      if (!document.querySelector('#header-bottom-left') &&
          !/\bwidth\s*=\s*1024\b/.test(viewport?.content || '')) return;
      root.classList.add('sifi-reddit-mobile');
    }
    // Subreddit themes assume a desktop canvas and override header geometry.
    // Disable only their dedicated stylesheet, leaving Reddit's base CSS intact.
    applyTheme();
    blockThemes();
    formatPreferenceOptions();
    if (!viewport && document.head) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.append(viewport);
    }
    if (viewport && viewport.content !== 'width=device-width, initial-scale=1') {
      viewport.content = 'width=device-width, initial-scale=1';
    }
  };
  initialize();
  // This observer lives only while HTML is being parsed, never during scrolling.
  const observer = new MutationObserver(initialize);
  observer.observe(document, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => {
    initialize();
    observer.disconnect();
    // Watch only the small head, never the post/comment tree or scrolling.
    if (document.head && document.documentElement.classList.contains('sifi-reddit-mobile')) {
      const headObserver = new MutationObserver(blockThemes);
      headObserver.observe(document.head, {
        childList: true, subtree: true, attributes: true,
        attributeFilter: ['media', 'disabled', 'href', 'title', 'rel'],
      });
      document.head.addEventListener('load', blockThemes, true);
    }
  }, { once: true });
})();
