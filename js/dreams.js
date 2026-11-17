/* ==========================================================================
   Little World of Wishes — dreams.js
   Dreams & Destinations: five animated wish cards, driven by config.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Dreams = {};
  var grid;

  function build() {
    var cards = LWOW.get('dreams.cards', []);
    if (!grid) return;
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();

    cards.forEach(function (card, index) {
      var article = document.createElement('article');
      article.className = 'card dream-card dream-card--' + (card.tone || 'rose');
      article.style.setProperty('--reveal-delay', (index * 110) + 'ms');
      article.setAttribute('data-reveal', '');

      var iconName = card.icon || 'sparkle';
      article.innerHTML =
        '<div class="dream-card__inner">' +
        '<div class="dream-card__art">' +
        '<span class="dream-card__orb" aria-hidden="true"></span>' +
        '<span class="dream-card__num" aria-hidden="true">0' + (index + 1) + '</span>' +
        LWOW.icon(iconName) +
        '</div>' +
        '<div class="stack stack--tight">' +
        '<h3>' + LWOW.esc(card.title) + '</h3>' +
        '<p>' + LWOW.esc(card.text) + '</p>' +
        '</div>' +
        '</div>';

      frag.appendChild(article);
    });

    grid.appendChild(frag);
    LWOW.observeReveals(grid);
  }

  Dreams.init = function () {
    grid = LWOW.qs('[data-dreams-grid]');
    if (!grid) return;
    build();

    // a few butterflies crossing the sky card area
    if (LWOW.prefersReducedMotion() || !LWOW.art || !LWOW.art.butterfly) return;
    var host = LWOW.qs('[data-dreams-sky]');
    if (!host) return;
    [0, 1].forEach(function (i) {
      var b = document.createElement('div');
      b.className = 'butterfly';
      b.setAttribute('aria-hidden', 'true');
      b.style.setProperty('--size', (26 + i * 10) + 'px');
      b.style.setProperty('--dur', (34 + i * 9) + 's');
      b.style.setProperty('--delay', (i * 6 + 2) + 's');
      b.style.setProperty('--from-x', '-8vw');
      b.style.setProperty('--from-y', (30 + i * 14) + 'vh');
      b.style.setProperty('--mid1-x', '30vw');
      b.style.setProperty('--mid1-y', (18 + i * 8) + 'vh');
      b.style.setProperty('--mid2-x', '60vw');
      b.style.setProperty('--mid2-y', (34 + i * 6) + 'vh');
      b.style.setProperty('--mid3-x', '86vw');
      b.style.setProperty('--mid3-y', (16 + i * 10) + 'vh');
      b.style.setProperty('--to-x', '110vw');
      b.style.setProperty('--to-y', (26 + i * 8) + 'vh');
      b.innerHTML = '<div class="butterfly__wings">' + LWOW.art.butterfly({ hue: i ? 'lilac' : 'sky' }) + '</div>';
      host.appendChild(b);
    });
  };

  LWOW.dreams = Dreams;
})();
