/* ==========================================================================
   Little World of Wishes — flowers.js
   A Garden of Wishes: 19 flowers, each holding one unique wish.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Flowers = {};
  var grid, modal, countEl, meterEl, completeEl;
  var seen = {};
  var currentIndex = -1;
  var lastTrigger = null;

  var TYPE_LABEL = {
    rose: 'Rose',
    tulip: 'Tulip',
    lily: 'Lily',
    sunflower: 'Sunflower',
    sakura: 'Cherry Blossom',
    daisy: 'Daisy',
    lavender: 'Lavender'
  };

  function seenCount() {
    return Object.keys(seen).length;
  }

  function updateMeter() {
    var n = seenCount();
    var total = LWOW.get('garden.flowers', []).length;
    if (countEl) countEl.textContent = n + ' / ' + total;
    if (meterEl) meterEl.setAttribute('aria-label', n + ' of ' + total + ' wishes found');
    if (completeEl) {
      completeEl.hidden = n < total;
    }
  }

  /* a soft label that floats up from the tapped flower */
  function bloomNote(el, text) {
    if (LWOW.prefersReducedMotion()) return;
    var rect = el.getBoundingClientRect();
    var note = document.createElement('div');
    note.className = 'bloom-note';
    note.setAttribute('aria-hidden', 'true');
    note.textContent = text;
    note.style.left = (rect.left + rect.width / 2).toFixed(0) + 'px';
    note.style.top = (rect.top + rect.height * 0.16).toFixed(0) + 'px';
    document.body.appendChild(note);
    window.setTimeout(function () { note.remove(); }, 1900);
  }

  function openWish(index, trigger) {
    var flowers = LWOW.get('garden.flowers', []);
    var flower = flowers[index];
    if (!flower || !modal) return;
    currentIndex = index;
    lastTrigger = trigger || null;
    var wasSeen = !!seen[index];

    var artHost = modal.querySelector('[data-wish-art]');
    var kicker = modal.querySelector('[data-wish-kicker]');
    var body = modal.querySelector('[data-wish-body]');
    var count = modal.querySelector('[data-wish-count]');

    if (artHost && LWOW.art) {
      artHost.innerHTML = LWOW.art.flower(flower.type, { seed: index * 3 + 5, scale: 0.95 });
    }
    if (kicker) {
      kicker.textContent = (flower.name || TYPE_LABEL[flower.type] || 'A flower') + ' · Wish ' + (index + 1);
    }
    if (body) body.textContent = flower.wish;
    if (count) {
      count.textContent = (seenCount() + (wasSeen ? 0 : 1)) + ' of ' + flowers.length + ' wishes discovered';
    }

    seen[index] = true;
    var card = grid.querySelector('[data-flower-index="' + index + '"]');
    if (card) {
      card.classList.add('is-seen');
      if (!wasSeen) {
        card.classList.add('is-blooming');
        window.setTimeout(function () { card.classList.remove('is-blooming'); }, 950);
        bloomNote(card, '+1 wish');
      }
    }
    updateMeter();
    if (!wasSeen && LWOW.sfx) LWOW.sfx('bloom');

    LWOW.openModal(modal);
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) window.setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 120);
  }

  function closeWish() {
    if (!modal || !LWOW.isModalOpen(modal)) return;
    var card = currentIndex >= 0 ? grid.querySelector('[data-flower-index="' + currentIndex + '"]') : null;
    LWOW.closeModal(modal);
    if (card) card.focus({ preventScroll: true });
    else if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function buildGrid() {
    var flowers = LWOW.get('garden.flowers', []);
    if (!grid) return;
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();

    flowers.forEach(function (flower, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flower-card reveal';
      btn.style.setProperty('--reveal-delay', Math.min(index * 34, 620) + 'ms');
      btn.setAttribute('data-flower-index', String(index));
      btn.setAttribute('aria-label', 'Open wish ' + (index + 1) + ' of ' + flowers.length);
      btn.setAttribute('aria-haspopup', 'dialog');

      var art = LWOW.art && LWOW.art.flower
        ? LWOW.art.flower(flower.type, { seed: index * 5 + 11 })
        : '';

      btn.innerHTML =
        '<span class="flower-card__pad" aria-hidden="true"></span>' +
        '<span class="flower-card__art">' + art + '</span>' +
        '<span class="flower-card__label" aria-hidden="true">' +
        LWOW.esc(flower.name || TYPE_LABEL[flower.type] || 'Flower') + '</span>';

      btn.addEventListener('click', function () { openWish(index, btn); });
      frag.appendChild(btn);
    });

    grid.appendChild(frag);
    LWOW.observeReveals(grid);
  }

  Flowers.init = function () {
    grid = LWOW.qs('[data-garden-grid]');
    if (!grid) return;
    modal = LWOW.qs('[data-wish-modal]');
    countEl = LWOW.qs('[data-garden-count]');
    meterEl = LWOW.qs('[data-garden-meter]');
    completeEl = LWOW.qs('[data-garden-complete]');

    buildGrid();
    updateMeter();

    if (modal) {
      var closeBtn = modal.querySelector('.modal__close');
      var nextBtn = modal.querySelector('[data-wish-next]');
      var doneBtn = modal.querySelector('[data-wish-close]');

      if (closeBtn) closeBtn.addEventListener('click', closeWish);
      if (doneBtn) {
        doneBtn.addEventListener('click', function () {
          closeWish();
          window.setTimeout(function () {
            var cta = LWOW.qs('[data-next]');
            if (cta) cta.focus({ preventScroll: true });
          }, 400);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          var total = LWOW.get('garden.flowers', []).length;
          var next = (currentIndex + 1) % total;
          openWish(next, grid.querySelector('[data-flower-index="' + next + '"]'));
        });
      }

      // click on the backdrop closes
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeWish();
      });

      // Escape and any other native close path still restore the page
      modal.addEventListener('close', function () {
        LWOW.closeModal(modal);
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
      });
    }

    // if the visitor comes back, keep the wishes they already opened
    updateMeter();
  };

  LWOW.flowers = Flowers;
})();
