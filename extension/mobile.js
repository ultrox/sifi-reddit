// Apply during parsing, before the desktop viewport can be painted. A classic
// header or its width=1024 viewport identifies old Reddit; modern Reddit is left alone.
(() => {
  if (!matchMedia('(max-device-width: 800px)').matches) return;
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
    blockThemes();
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
