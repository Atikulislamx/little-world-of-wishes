/* ==========================================================================
   Little World of Wishes — surprises.js
   Three hidden surprises in the evening garden; when all three are found the
   sky celebrates with a small firework.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Surprises = {};
  var grid, modal, noteEl, dots = [];
  var found = {};
  var currentBtn = null;
  var completed = false;

  var ART = {
    gift: function () { return LWOW.art.gift(); },
    star: function () { return LWOW.art.wishingStar(); },
    butterfly: function () { return LWOW.art.butterfly({ hue: 'lilac' }); }
  };

  function foundCount() {
    return Object.keys(found).length;
  }

  function updateDots() {
    dots.forEach(function (dot) {
      var key = dot.getAttribute('data-key');
      dot.classList.toggle('is-found', !!found[key]);
      dot.setAttribute('aria-label', (found[key] ? 'Found: ' : 'Still hidden: ') + key);
    });
  }

  function firework(x, y) {
    if (LWOW.prefersReducedMotion()) return;
    var layer = LWOW.qs('.firework-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'firework-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    var burst = document.createElement('div');
    burst.className = 'firework';
    burst.style.setProperty('--fx', x.toFixed(1) + '%');
    burst.style.setProperty('--fy', y.toFixed(1) + '%');
    var colors = ['#FFE6A3', '#F8C3D6', '#D9C6F5', '#FFF4D6', '#F2B2C6', '#BFE7DA'];
    var total = LWOW.isLowPower() ? 22 : 34;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var angle = (Math.PI * 2 * i) / total + Math.random() * 0.24;
      var dist = 60 + Math.random() * 130;
      var spark = document.createElement('span');
      spark.className = 'firework__spark';
      spark.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      spark.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(1) + 'px');
      spark.style.setProperty('--c', colors[i % colors.length]);
      spark.style.setProperty('--s', (3 + Math.random() * 4).toFixed(1) + 'px');
      spark.style.setProperty('--dur', (1100 + Math.random() * 900).toFixed(0) + 'ms');
      spark.style.setProperty('--delay', (Math.random() * 160).toFixed(0) + 'ms');
      frag.appendChild(spark);
    }
    burst.appendChild(frag);
    layer.appendChild(burst);
    window.setTimeout(function () { burst.remove(); }, 2600);
  }

  function celebrate() {
    if (completed) return;
    completed = true;
    if (noteEl) noteEl.textContent = LWOW.get('surprise.allFound', 'You found all three.');
    if (LWOW.sfx) LWOW.sfx('firework');

    if (LWOW.prefersReducedMotion()) return;
    var spots = [[22, 30], [50, 20], [76, 28], [36, 42], [64, 44]];
    spots.forEach(function (spot, i) {
      window.setTimeout(function () {
        firework(spot[0], spot[1]);
        if (LWOW.sfx && i < 2) LWOW.sfx('pop');
      }, i * 620);
    });
  }

  function openSurprise(item, btn) {
    if (!modal) return;
    currentBtn = btn;
    var key = item.key;
    var isNew = !found[key];
    found[key] = true;
    btn.classList.add('is-found');
    updateDots();

    var artHost = modal.querySelector('[data-surprise-art]');
    var kicker = modal.querySelector('[data-surprise-kicker]');
    var body = modal.querySelector('[data-surprise-body]');
    var count = modal.querySelector('[data-surprise-count]');

    if (artHost) artHost.innerHTML = (ART[key] || ART.star)();
    if (kicker) kicker.textContent = item.label || 'A little surprise';
    if (body) body.textContent = item.message || '';
    if (count) {
      count.textContent = foundCount() + ' of ' + LWOW.get('surprise.items', []).length + ' ' +
        LWOW.get('surprise.progress', 'surprises found');
    }

    if (isNew) {
      if (LWOW.sfx) LWOW.sfx('sparkle');
      celebrateIfDone();
    }

    LWOW.openModal(modal);
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) window.setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 120);
  }

  function celebrateIfDone() {
    var total = LWOW.get('surprise.items', []).length;
    if (foundCount() >= total) celebrate();
  }

  function closeSurprise() {
    if (!modal || !LWOW.isModalOpen(modal)) return;
    LWOW.closeModal(modal);
    if (currentBtn) currentBtn.focus({ preventScroll: true });
  }

  function build() {
    var items = LWOW.get('surprise.items', []);
    if (!grid) return;
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();

    items.forEach(function (item, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'surprise-item reveal';
      btn.style.setProperty('--reveal-delay', (i * 130) + 'ms');
      btn.setAttribute('data-key', item.key);
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-label', item.label + '. ' + item.hint);

      var art = (ART[item.key] || ART.star)();

      btn.innerHTML =
        '<span class="surprise-item__stage">' +
        '<span class="surprise-item__tick" aria-hidden="true">' + LWOW.icon('check') + '</span>' +
        '<span class="surprise-item__art">' + art + '</span>' +
        '</span>' +
        '<span class="surprise-item__label">' + LWOW.esc(item.label) + '</span>' +
        '<span class="surprise-item__hint">' + LWOW.esc(item.hint) + '</span>';

      btn.addEventListener('click', function () { openSurprise(item, btn); });
      frag.appendChild(btn);
    });

    grid.appendChild(frag);
    LWOW.observeReveals(grid);
  }

  Surprises.init = function () {
    grid = LWOW.qs('[data-surprise-grid]');
    if (!grid) return;
    modal = LWOW.qs('[data-surprise-modal]');
    noteEl = LWOW.qs('[data-surprise-note]');
    dots = LWOW.qsa('[data-surprise-dot]');

    build();
    updateDots();

    if (modal) {
      var closeBtn = modal.querySelector('.modal__close');
      var doneBtn = modal.querySelector('[data-surprise-close]');
      if (closeBtn) closeBtn.addEventListener('click', closeSurprise);
      if (doneBtn) doneBtn.addEventListener('click', closeSurprise);
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeSurprise();
      });
      modal.addEventListener('close', function () {
        LWOW.closeModal(modal);
        if (currentBtn) currentBtn.focus({ preventScroll: true });
      });
    }

    // floating lanterns drifting through the garden
    if (!LWOW.prefersReducedMotion() && LWOW.art && LWOW.art.lantern) {
      var host = LWOW.qs('[data-lanterns]');
      if (host) {
        var n = LWOW.isLowPower() ? 3 : 5;
        for (var i = 0; i < n; i++) {
          var l = document.createElement('div');
          l.className = 'lantern-float';
          l.setAttribute('aria-hidden', 'true');
          l.style.setProperty('--size', (30 + Math.random() * 26).toFixed(0) + 'px');
          l.style.setProperty('--dur', (32 + Math.random() * 18).toFixed(0) + 's');
          l.style.setProperty('--delay', (i * 6.5).toFixed(1) + 's');
          l.style.setProperty('--drift', ((Math.random() - 0.5) * 90).toFixed(0) + 'px');
          l.style.left = (8 + Math.random() * 82).toFixed(1) + '%';
          l.style.bottom = '-6%';
          l.innerHTML = LWOW.art.lantern();
          host.appendChild(l);
        }
      }
    }
  };

  LWOW.surprises = Surprises;
})();
