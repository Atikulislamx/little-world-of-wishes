/* ==========================================================================
   Little World of Wishes — router.js (progressive enhancement)
   --------------------------------------------------------------------------
   Every one of the eight pages is a real, standalone HTML file that works on
   GitHub Pages with no server routing at all. This script only makes moving
   between them feel seamless:

     • it swaps the page in place instead of reloading the document, so the
       soundtrack is never interrupted and transitions are instant;
     • browser back / forward still work (each visit is a real history entry);
     • any failure falls back to a normal navigation;
     • hard refreshes, direct links and shared URLs behave exactly as before.

   Opt out by adding data-soft-nav="off" to <html>.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var html = document.documentElement;

  var reduced = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  var supported = !!(
    window.fetch && window.DOMParser && window.Promise && window.history &&
    window.history.pushState && typeof window.DOMParser.prototype.parseFromString === 'function'
  );
  if (!supported || html.getAttribute('data-soft-nav') === 'off') return;

  var Busy = {
    navigate: false
  };

  /* --------------------------------------------------------- stylesheets
     The incoming document may need a CSS file the current one never loaded,
     so make sure every <link rel="stylesheet"> from both documents is present
     before swapping the body. */
  function ensureStyles(doc) {
    var have = {};
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) {
      have[l.getAttribute('href')] = true;
    });
    var waiting = [];
    var links = doc.querySelectorAll('link[rel="stylesheet"]');
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href');
      if (!href || have[href]) return;
      waiting.push(new Promise(function (resolve) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        l.onload = resolve;
        l.onerror = resolve;
        document.head.appendChild(l);
      }));
    });
    return Promise.all(waiting);
  }

  function syncHead(doc) {
    var nextTitle = doc.querySelector('title');
    if (nextTitle) document.title = nextTitle.textContent;

    var metaNames = ['description', 'theme-color', 'color-scheme', 'robots'];
    metaNames.forEach(function (name) {
      var fresh = doc.querySelector('meta[name="' + name + '"]');
      var current = document.querySelector('meta[name="' + name + '"]');
      if (fresh && current) current.setAttribute('content', fresh.getAttribute('content') || '');
      else if (fresh && !current) {
        var m = document.createElement('meta');
        m.name = name;
        m.content = fresh.getAttribute('content') || '';
        document.head.appendChild(m);
      }
    });
  }

  function runScripts(container) {
    var scripts = Array.prototype.slice.call(container.querySelectorAll('script'));
    scripts.forEach(function (old) {
      if (old.src && !old.hasAttribute('data-soft-run')) return;
      var fresh = document.createElement('script');
      Array.prototype.forEach.call(old.attributes, function (attr) {
        if (attr.name === 'data-soft-run') return;
        fresh.setAttribute(attr.name, attr.value);
      });
      fresh.text = old.text;
      fresh.setAttribute('data-soft-run', 'true');
      old.parentNode.replaceChild(fresh, old);
    });
  }

  function cleanup() {
    // tear down state that is tied to the page we are leaving
    if (LWOW.Ambient && LWOW.Ambient.stop) LWOW.Ambient.stop();
    Array.prototype.forEach.call(document.querySelectorAll('.confetti-layer, .firework-layer, .unlock-bloom, .toast-region, .bloom-note, .music-prompt'), function (node) {
      node.remove();
    });
    document.querySelectorAll('dialog[open]').forEach(function (d) {
      try { d.close(); } catch (err) { /* ignore */ }
    });
    document.body.classList.remove('no-scroll-active');
    if (window.LWOW && LWOW.letter) LWOW.letter = undefined;
  }

  function swapPage(doc, url) {
    var nextBody = doc.body;
    if (!nextBody) throw new Error('No body in the incoming document');

    cleanup();

    // keep our audio element (it lives in a stable wrapper) alive across swaps
    var audioKeeper = document.createElement('div');
    audioKeeper.id = 'lwow-audio-keeper';
    audioKeeper.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    var existingAudio = document.querySelector('audio[data-lwow-music]');
    if (existingAudio) audioKeeper.appendChild(existingAudio);

    html.removeAttribute('data-page');
    html.removeAttribute('data-ambient');
    var page = nextBody.getAttribute('data-page') ||
      (doc.documentElement && doc.documentElement.getAttribute('data-page'));
    if (page) html.setAttribute('data-page', page);
    var ambient = doc.documentElement && doc.documentElement.getAttribute('data-ambient');
    if (ambient) html.setAttribute('data-ambient', ambient);
    if (doc.documentElement && doc.documentElement.getAttribute('lang')) {
      html.setAttribute('lang', doc.documentElement.getAttribute('lang'));
    }

    var onDark = /page--on-dark/.test(nextBody.className);
    html.classList.toggle('on-dark', onDark);
    html.classList.remove('is-leaving');

    document.body.replaceWith(document.adoptNode(nextBody));
    document.body.appendChild(audioKeeper);

    syncHead(doc);
    if (url) window.history.pushState({ lwowPage: page }, '', url);
    window.scrollTo(0, 0);

    runScripts(document.body);
    if (LWOW.boot) LWOW.boot({ soft: true });
    if (LWOW.music && LWOW.music.refresh) LWOW.music.refresh();
    if (existingAudio && LWOW.music && LWOW.music.volumeUp) {
      var wasAudible = !existingAudio.paused;
      if (wasAudible) {
        existingAudio.volume = 0;
        LWOW.music.volumeUp();
      }
    }
  }

  function navigate(url, opts) {
    var options = opts || {};
    if (Busy.navigate) return Promise.resolve(false);
    if (!url) return Promise.resolve(false);

    var target = new URL(url, location.href);
    if (target.origin !== location.origin) {
      location.href = target.href;
      return Promise.resolve(false);
    }
    if (target.pathname === location.pathname && target.search === location.search && !options.force) {
      return Promise.resolve(false);
    }

    Busy.navigate = true;
    document.body.classList.add('is-leaving');

    var fetcher = window.fetch(target.href, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (text) {
        var doc = new window.DOMParser().parseFromString(text, 'text/html');
        return ensureStyles(doc).then(function () {
          var wait = reduced() ? 0 : 260;
          return new Promise(function (resolve) {
            window.setTimeout(function () {
              swapPage(doc, options.replace ? null : target.href);
              if (options.replace) window.history.replaceState({ lwowPage: target.pathname }, '', target.href);
              resolve(true);
            }, wait);
          });
        });
      })
      .catch(function () {
        // something went wrong — just do a normal page load
        location.href = target.href;
        return false;
      })
      .then(function (result) {
        Busy.navigate = false;
        return result;
      });

    return fetcher;
  }

  /* ------------------------------------------------------------- hooks */
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    var link = event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.getAttribute('data-soft') === 'off') return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    // the Secret Gate always gets a clean, full load so its PIN state is fresh
    if (document.documentElement.getAttribute('data-page') === 'gate') return;
    var resolved = new URL(href, location.href);
    if (resolved.origin !== location.origin) return;
    if (!/\.html?$/.test(resolved.pathname) && resolved.pathname !== '/') return;

    event.preventDefault();
    if (LWOW.sfx) LWOW.sfx('tap');
    navigate(resolved.href);
  });

  window.addEventListener('popstate', function () {
    navigate(location.href, { force: true });
  });

  // expose so page modules can hop pages with a soft transition
  LWOW.go = function (url) {
    return navigate(url);
  };
})();
