/* ==========================================================================
   Little World of Wishes — main.js
   The shared runtime: config binding, icons, backdrop, ambient canvas,
   reveal-on-scroll, toasts, page transitions and small helpers.
   Everything hangs off the global `LWOW` namespace.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = window.LWOW_CONFIG || {};
  var Art = window.LWOWArt || {};

  var LWOW = (window.LWOW = window.LWOW || {});
  LWOW.config = CONFIG;
  LWOW.art = Art;

  /* --------------------------------------------------------------- root
     Scripts live in js/, so the page root is one level up. Using the absolute
     URL of this module keeps every generated path correct on GitHub Pages
     project sites, deep links and local previews alike. */
  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || document.baseURI;
  var SITE_ROOT = SCRIPT_URL.replace(/js\/[^/]*$/, '');
  function asset(path) {
    return SITE_ROOT + String(path).replace(/^\.?\//, '');
  }
  LWOW.root = SITE_ROOT;
  LWOW.asset = asset;

  /* ------------------------------------------------------------ helpers */
  var qs = function (sel, root) { return (root || document).querySelector(sel); };
  var qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  LWOW.qs = qs;
  LWOW.qsa = qsa;

  /** read a dot-path from the config, e.g. get('letter.paragraphs') */
  function get(path, fallback) {
    var parts = String(path).split('.');
    var node = CONFIG;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return fallback;
      node = node[parts[i]];
    }
    return node == null ? fallback : node;
  }
  LWOW.get = get;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  LWOW.esc = esc;

  /** *asterisks* become <em>…</em> after escaping */
  function rich(str) {
    return esc(str).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
  LWOW.rich = rich;

  function icon(name, opts) {
    if (!Art.icon) return '';
    return Art.icon(name, opts);
  }
  LWOW.icon = icon;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  LWOW.prefersReducedMotion = prefersReducedMotion;

  function isCoarse() {
    return window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }
  LWOW.isCoarse = isCoarse;

  function isLowPower() {
    var cores = navigator.hardwareConcurrency || 4;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(conn && conn.saveData);
    return saveData || cores <= 4;
  }
  LWOW.isLowPower = isLowPower;

  function pageId() {
    return document.documentElement.getAttribute('data-page') || 'gate';
  }
  LWOW.pageId = pageId;

  /* ----------------------------------------------------- session state */
  function storage() {
    return window.LWOWStore || {
      get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
      remove: function (k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
    };
  }

  function isUnlocked() {
    return storage().get(get('pin.storageKey', 'lwow.unlocked')) === '1';
  }
  function unlock() {
    storage().set(get('pin.storageKey', 'lwow.unlocked'), '1');
  }
  function lock() {
    storage().remove(get('pin.storageKey', 'lwow.unlocked'));
  }
  LWOW.isUnlocked = isUnlocked;
  LWOW.unlock = unlock;
  LWOW.lock = lock;

  /* -------------------------------------------------------------- modal
     Native <dialog> isolates the page for assistive tech on its own; this
     helper adds the graceful fallbacks and keeps the background inert while
     a dialog is open. Every dialog-close path routes through closeModal. */
  var openModals = 0;
  function modalBackground(flag) {
    var main = document.querySelector('.page__main');
    var foot = document.querySelector('.page-foot');
    [main, foot].forEach(function (node) {
      if (!node) return;
      if (flag) node.setAttribute('inert', '');
      else node.removeAttribute('inert');
    });
    document.body.classList.toggle('no-scroll-active', flag);
  }

  /* keep Tab inside the dialog even where the native trap lets focus
     slip to <body> between wraps */
  function modalFocusables(dialog) {
    var selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(dialog.querySelectorAll(selector), function (el) {
      return el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function trapModalTab(event, dialog) {
    if (event.key !== 'Tab') return;
    var list = modalFocusables(dialog);
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    var active = document.activeElement;
    var inside = dialog.contains(active);
    if (event.shiftKey) {
      if (!inside || active === first) { event.preventDefault(); last.focus(); }
    } else if (!inside || active === last) {
      event.preventDefault(); first.focus();
    }
  }

  function openModal(dialog) {
    if (!dialog) return false;
    if (!dialog.dataset.trapBound) {
      dialog.dataset.trapBound = '1';
      dialog.addEventListener('keydown', function (event) { trapModalTab(event, dialog); });
    }
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
    }
    openModals += 1;
    modalBackground(true);
    return true;
  }

  function closeModal(dialog) {
    if (!dialog) return;
    if (dialog.hasAttribute('open')) {
      if (typeof dialog.close === 'function') {
        try { dialog.close(); } catch (err) { dialog.removeAttribute('open'); }
      } else {
        dialog.removeAttribute('open');
      }
    }
    dialog.removeAttribute('open');
    openModals = 0;
    modalBackground(false);
  }

  function isModalOpen(dialog) {
    return !!(dialog && dialog.hasAttribute('open'));
  }

  LWOW.openModal = openModal;
  LWOW.closeModal = closeModal;
  LWOW.isModalOpen = isModalOpen;

  /* ------------------------------------------------------------- toast */
  var toastRegion = null;
  function toast(message, ms) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastRegion);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastRegion.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-leaving');
      window.setTimeout(function () { el.remove(); }, 280);
    }, ms || 2600);
  }
  LWOW.toast = toast;

  /* ------------------------------------------------------ config binder */
  function bindConfig(root) {
    qsa('[data-bind]', root).forEach(function (el) {
      var value = get(el.getAttribute('data-bind'));
      if (value == null) return;
      el.innerHTML = rich(value);
    });
    qsa('[data-bind-text]', root).forEach(function (el) {
      var value = get(el.getAttribute('data-bind-text'));
      if (value == null) return;
      el.textContent = value;
    });
    qsa('[data-icon]', root).forEach(function (el) {
      if (el.querySelector('svg')) return;
      el.insertAdjacentHTML('afterbegin', icon(el.getAttribute('data-icon')));
    });
    // dates
    qsa('[data-date]', root).forEach(function (el) {
      var kind = el.getAttribute('data-date') || 'display';
      el.textContent = get('birthday.' + kind, '');
    });
  }
  LWOW.bindConfig = bindConfig;

  /* ------------------------------------------------- core copy binder
     Keeps the eight hand-written pages in sync with js/config.js, so the
     visible copy really is editable from that one file (the HTML stays as a
     readable, no-JavaScript fallback). Only the copy the config owns is
     touched: headings, eyebrows, intros, calls to action. */
  function bindCoreCopy(root) {
    qsa('[data-core-bind]', root).forEach(function (el) {
      var value = get(el.getAttribute('data-core-bind'));
      if (value == null || value === '') return;
      var mode = el.getAttribute('data-core-rich');
      if (mode === 'heading') {
        // a full sentence used as a heading: emphasise the closing phrase
        // after the comma (e.g. "19 Flowers, 19 Beautiful Wishes")
        var safe = esc(value);
        var cut = safe.lastIndexOf(', ');
        el.innerHTML = cut > 0
          ? safe.slice(0, cut + 2) + '<em>' + safe.slice(cut + 2) + '</em>'
          : safe;
      } else if (mode === 'lines') {
        // two-line display headings ("Welcome to / Your Little World"):
        // split before the last two or three words and italicise the tail
        var full = esc(value);
        var parts = full.split(' ');
        var tail = parts.length >= 4 ? 3 : 2;
        el.innerHTML = '<span>' + parts.slice(0, -tail).join(' ') + '</span> <span><em>' +
          parts.slice(-tail).join(' ') + '</em></span>';
      } else if (mode === '1') {
        // headings keep their italic emphasis: the last two words become <em>
        var text = esc(value);
        var words = text.split(' ');
        if (words.length > 2) {
          el.innerHTML = words.slice(0, -2).join(' ') + ' <em>' + words.slice(-2).join(' ') + '</em>';
        } else {
          el.innerHTML = text;
        }
      } else {
        el.textContent = value;
      }
    });
  }
  LWOW.bindCoreCopy = bindCoreCopy;

  /* ---------------------------------------------------------- backdrop */
  var BACKDROPS = {
    gate: 'sakura-gate',
    welcome: 'garden-morning',
    celebration: 'festival-glow',
    garden: 'garden-wishes',
    letter: 'letter-desk',
    dreams: 'dreams-sky',
    surprise: 'evening-magic',
    finale: 'night-garden'
  };

  function setupBackdrop() {
    var host = qs('.backdrop');
    if (!host || host.dataset.ready === 'true') return;
    host.dataset.ready = 'true';
    if (get('theme.backdropOverride') === false) return;

    var override = get('theme.backdropOverride');
    var name = override || BACKDROPS[pageId()];
    if (!name) return;

    var picture = document.createElement('picture');
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = asset('assets/backgrounds/' + name + '-sm.webp') + ' 960w, ' +
      asset('assets/backgrounds/' + name + '.webp') + ' 1920w';
    source.sizes = '100vw';

    var img = document.createElement('img');
    img.src = asset('assets/backgrounds/' + name + '.jpg');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.setAttribute('aria-hidden', 'true');
    img.width = 1280;
    img.height = 720;

    var reveal = function () { img.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) {
      reveal();
    } else {
      img.addEventListener('load', reveal, { once: true });
    }
    img.addEventListener('error', function () {
      // graceful fallback: the CSS gradient behind the picture stays visible
      picture.remove();
    }, { once: true });

    picture.appendChild(source);
    picture.appendChild(img);
    host.insertBefore(picture, host.firstChild);
  }
  LWOW.setupBackdrop = setupBackdrop;

  /* ------------------------------------------------- ambient canvas */
  var SINGULAR = { petals: 'petal', petal: 'petal', sparkles: 'sparkle', sparkle: 'sparkle', fireflies: 'firefly', firefly: 'firefly' };

  var Ambient = (function () {
    var canvas = null;
    var ctx = null;
    var particles = [];
    var rafId = 0;
    var running = false;
    var lastTime = 0;
    var dpr = 1;
    var w = 0;
    var h = 0;
    var kinds = {};
    var petalColors = ['#F9C9D9', '#F6B7CB', '#FCE3EB', '#EFCBE8', '#FAD9C2'];
    var glowColors = ['255, 246, 214', '255, 228, 176', '224, 210, 250', '255, 236, 240'];

    function mk(kind) {
      var p = { kind: kind, x: Math.random() * w, y: Math.random() * h, seed: Math.random() * 1000 };
      if (kind === 'sparkle' || kind === 'firefly') {
        p.color = glowColors[(Math.random() * glowColors.length) | 0];
      }
      if (kind === 'sparkle') {
        p.size = 1 + Math.random() * 2.4;
        p.vy = 0.02 + Math.random() * 0.08;
        p.vx = (Math.random() - 0.5) * 0.06;
        p.phase = Math.random() * Math.PI * 2;
        p.speed = 0.9 + Math.random() * 1.6;
      } else if (kind === 'firefly') {
        p.size = 1.6 + Math.random() * 2.2;
        p.vx = (Math.random() - 0.5) * 0.16;
        p.vy = -0.03 - Math.random() * 0.1;
        p.phase = Math.random() * Math.PI * 2;
        p.speed = 0.55 + Math.random() * 0.9;
        p.amp = 14 + Math.random() * 22;
      } else {
        p.size = 6 + Math.random() * 10;
        p.vx = 0.1 + Math.random() * 0.32;
        p.vy = 0.28 + Math.random() * 0.55;
        p.rot = Math.random() * Math.PI * 2;
        p.vr = (Math.random() - 0.5) * 0.012;
        p.sway = Math.random() * Math.PI * 2;
        p.swaySpeed = 0.4 + Math.random() * 0.7;
        p.color = petalColors[(Math.random() * petalColors.length) | 0];
        p.alpha = 0.5 + Math.random() * 0.42;
      }
      return p;
    }

    function targetCount(kind) {
      var mobile = w < 700;
      var low = isLowPower();
      var base = {
        petal: mobile ? 10 : 20,
        sparkle: mobile ? 14 : 26,
        firefly: mobile ? 8 : 15
      }[kind] || 10;
      if (low) base = Math.round(base * 0.6);
      return Math.max(4, base);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      particles = [];
      Object.keys(kinds).forEach(function (kind) {
        var n = Math.min(kinds[kind], targetCount(kind));
        for (var i = 0; i < n; i++) particles.push(mk(kind));
      });
    }

    function drawPetal(p, t) {
      ctx.save();
      ctx.translate(p.x + Math.sin(t * 0.0006 + p.sway) * 16, p.y);
      ctx.rotate(p.rot + Math.sin(t * 0.0004 + p.sway) * 0.4);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      var s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.4, s * 0.7, s * 0.62, 0, s * 0.86);
      ctx.bezierCurveTo(-s * 0.7, s * 0.62, -s * 0.95, -s * 0.4, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    function drawGlow(p, t, kind) {
      var twinkle = kind === 'firefly'
        ? 0.35 + 0.65 * Math.pow(Math.abs(Math.sin(t * 0.0008 * p.speed + p.phase)), 1.4)
        : 0.15 + 0.85 * Math.pow(Math.abs(Math.sin(t * 0.0009 * p.speed + p.phase)), 2.2);
      var r = p.size * (kind === 'firefly' ? 4.5 : 6.5);
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0, 'rgba(' + p.color + ',' + (0.95 * twinkle).toFixed(3) + ')');
      grad.addColorStop(0.45, 'rgba(' + p.color + ',' + (0.4 * twinkle).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + p.color + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,248,' + (0.8 * twinkle).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, p.size * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }

    function step(dt, t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.kind === 'petal') {
          p.x += p.vx * dt * 0.06;
          p.y += p.vy * dt * 0.06;
          p.rot += p.vr * dt * 0.06;
          if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
          if (p.x > w + 30) p.x = -30;
          drawPetal(p, t);
        } else if (p.kind === 'firefly') {
          p.x += Math.sin(t * 0.0007 * p.speed + p.phase) * p.amp * dt * 0.0006 + p.vx * dt * 0.05;
          p.y += p.vy * dt * 0.05;
          if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          drawGlow(p, t, 'firefly');
        } else {
          p.x += p.vx * dt * 0.02;
          p.y += p.vy * dt * 0.02;
          if (p.y > h + 10) { p.y = -10; }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          drawGlow(p, t, 'sparkle');
        }
      }
    }

    function loop(t) {
      if (!running) return;
      var dt = Math.min(48, t - (lastTime || t));
      lastTime = t;
      step(dt, t);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running || !canvas) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(loop);
      canvas.classList.add('is-live');
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    function init(kindMap) {
      if (prefersReducedMotion()) return false;
      canvas = qs('.ambient-canvas');
      if (!canvas || !canvas.getContext) return false;
      kinds = {};
      Object.keys(kindMap || {}).forEach(function (key) {
        var kind = SINGULAR[key] || SINGULAR[key.replace(/s$/, '')] || null;
        if (kind) kinds[kind] = (kinds[kind] || 0) + (kindMap[key] || 1);
      });
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return false;
      resize();
      start();
      window.addEventListener('resize', debounce(resize, 220));
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else start();
      });
      return true;
    }

    return { init: init, stop: stop, start: start };
  })();

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }
  LWOW.debounce = debounce;

  var AMBIENT_BY_PAGE = {
    gate: { petals: true, sparkles: true },
    welcome: { petals: true, sparkles: true },
    celebration: { petals: true, sparkles: true },
    garden: { petals: true },
    letter: { petals: true, sparkles: true },
    dreams: { sparkles: true, petals: true },
    surprise: { fireflies: true, sparkles: true },
    finale: { fireflies: true, sparkles: true }
  };

  function setupAmbient() {
    var data = document.documentElement.getAttribute('data-ambient');
    var spec = data ? null : AMBIENT_BY_PAGE[pageId()];
    var kinds = {};
    if (data) {
      data.split(/[\s,]+/).forEach(function (k) { if (k) kinds[k] = true; });
    } else if (spec) {
      kinds = spec;
    }
    var counts = { petal: 20, sparkle: 26, firefly: 15 };
    var map = {};
    Object.keys(kinds).forEach(function (kind) {
      map[kind] = counts[kind] || 10;
    });
    Ambient.init(map);
  }
  LWOW.setupAmbient = setupAmbient;

  /* --------------------------------------------------- reveal observer */
  var observer = null;
  function observeReveals(root) {
    var items = qsa('.reveal:not(.is-visible), [data-reveal]', root || document);
    if (!items.length) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px 2% 0px', threshold: 0.01 });
    }
    items.forEach(function (el) { observer.observe(el); });
  }
  LWOW.observeReveals = observeReveals;

  /* Content is never hidden permanently: anything that has not revealed itself
     within a few seconds is simply shown. This keeps the page readable even if
     the observer never fires (very short viewports, zoom, odd browsers). */
  function revealSafetyNet() {
    var pending = qsa('.reveal:not(.is-visible), [data-reveal]:not(.is-visible)');
    if (!pending.length) return;
    pending.forEach(function (el, i) {
      window.setTimeout(function () {
        if (!el.isConnected) return;
        var box = el.getBoundingClientRect();
        // only "force" items already near or above the viewport
        if (box.top < window.innerHeight * 1.6) el.classList.add('is-visible');
      }, 900 + i * 40);
    });
  }
  LWOW.revealSafetyNet = revealSafetyNet;

  /* ------------------------------------------------------- page frame */
  function setupHeader() {
    var body = document.body;
    if (body.classList.contains('page--on-dark')) {
      document.documentElement.classList.add('on-dark');
    }
    // step label + journey dots
    var journey = get('journey', []);
    var current = journey.filter(function (p) { return p.file === currentFile(); })[0];
    var index = current ? journey.indexOf(current) : 0;

    qsa('[data-journey-dots]').forEach(function (host) {
      if (host.children.length) return;
      journey.forEach(function (page, i) {
        var dot = document.createElement('span');
        dot.className = 'journey__dot' + (i < index ? ' is-done' : '') + (i === index ? ' is-current' : '');
        dot.setAttribute('aria-hidden', 'true');
        host.appendChild(dot);
      });
    });

    qsa('[data-journey-label]').forEach(function (el) {
      el.textContent = current
        ? 'Step ' + current.step + ' · ' + current.label
        : '';
    });

    var rail = qs('.progress-rail');
    if (rail) {
      var pct = journey.length > 1 ? (index / (journey.length - 1)) * 100 : 0;
      rail.style.setProperty('--journey-progress', pct.toFixed(2) + '%');
      var fill = rail.querySelector('.progress-rail__fill');
      if (fill) fill.style.width = pct.toFixed(2) + '%';
      rail.setAttribute('aria-valuenow', String(Math.round(pct)));
      rail.setAttribute('aria-valuetext', current ? current.label : '');
    }

    if (!window.LWOW_SCROLL_FALLBACK) {
      window.LWOW_SCROLL_FALLBACK = true;
      window.addEventListener('scroll', debounce(revealSafetyNet, 420), { passive: true });
    }

    var topbar = qs('.topbar');
    if (topbar) {
      var onScroll = function () {
        topbar.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  function currentFile() {
    var parts = location.pathname.split('/');
    var file = parts[parts.length - 1] || 'index.html';
    return file;
  }
  LWOW.currentFile = currentFile;

  /* ----------------------------------------------------- page transition */
  // Real page transitions are handled by js/router.js (soft navigation with a
  // graceful fallback to a normal load). Kept here only as a no-op hook so page
  // modules can call it safely.
  function setupPageTransitions() {}
  LWOW.setupPageTransitions = setupPageTransitions;

  /* ------------------------------------------------------------- boot */
  function boot(options) {
    var opts = options || {};
    bindConfig();
    bindCoreCopy();
    if (LWOW.shell && LWOW.shell.init) LWOW.shell.init();
    setupBackdrop();
    setupHeader();
    observeReveals();
    setupAmbient();
    setupPageTransitions();

    if (LWOW.music && LWOW.music.init) LWOW.music.init();
    if (LWOW.nav && LWOW.nav.init) LWOW.nav.init();

    var pageModule = {
      gate: 'pin',
      welcome: 'welcome',
      celebration: 'cake',
      garden: 'flowers',
      letter: 'letter',
      dreams: 'dreams',
      surprise: 'surprises',
      finale: 'finale'
    }[pageId()];

    if (pageModule && LWOW[pageModule] && typeof LWOW[pageModule].init === 'function') {
      LWOW[pageModule].init();
    }

    if (opts.soft) {
      document.querySelectorAll('script[data-soft-run]').forEach(function (node) {
        node.removeAttribute('data-soft-run');
      });
    }

    window.setTimeout(revealSafetyNet, 1200);
    document.body.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('lwow:page', { detail: { page: pageId(), soft: !!opts.soft } }));
  }

  LWOW.boot = boot;
  LWOW.Ambient = Ambient;

  // Deferred scripts (including this one) all run before DOMContentLoaded, so
  // booting on that event guarantees every page module exists. Only an already
  // complete document (e.g. script injected late) boots immediately.
  if (document.readyState === 'complete') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', function () { boot(); }, { once: true });
  }
})();
