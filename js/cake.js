/* ==========================================================================
   Little World of Wishes — cake.js
   The birthday cake: tap each candle, watch it go out, collect confetti.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Cake = {};
  var stage, svgHost, hintEl, messageEl, againBtn, counterEl;
  var candles = [];
  var out = 0;

  var CONFETTI_COLORS = ['#F5B8CE', '#FCE4EC', '#DCCCF5', '#FFF0C9', '#D8A1A9', '#F9DCE7', '#CDE4D3', '#FFE7A8'];

  function reduced() {
    return LWOW.prefersReducedMotion();
  }

  function confetti(count) {
    if (reduced()) return;
    var total = Math.min(count || 90, LWOW.isLowPower() ? 46 : 100);
    var layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var piece = document.createElement('span');
      var isPetal = Math.random() > 0.72;
      piece.className = 'confetti-piece' + (isPetal ? ' confetti-piece--petal' : '');
      piece.style.setProperty('--x', (Math.random() * 100).toFixed(2) + '%');
      piece.style.setProperty('--w', (isPetal ? 8 : 5 + Math.random() * 6).toFixed(1) + 'px');
      piece.style.setProperty('--h', (isPetal ? 11 : 9 + Math.random() * 10).toFixed(1) + 'px');
      piece.style.setProperty('--c', CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0]);
      piece.style.setProperty('--sway', ((Math.random() - 0.5) * 260).toFixed(0) + 'px');
      piece.style.setProperty('--dur', (2.6 + Math.random() * 2.4).toFixed(2) + 's');
      piece.style.setProperty('--delay', (Math.random() * 0.9).toFixed(2) + 's');
      piece.style.setProperty('--r', isPetal ? '60% 40% 55% 45% / 70% 60% 40% 30%' : Math.random() > 0.6 ? '50%' : '2px');
      frag.appendChild(piece);
    }
    layer.appendChild(frag);
    document.body.appendChild(layer);
    window.setTimeout(function () {
      layer.style.transition = 'opacity 700ms ease';
      layer.style.opacity = '0';
      window.setTimeout(function () { layer.remove(); }, 760);
    }, 4200);
  }
  LWOW.confetti = confetti;

  function updateCounter() {
    if (!counterEl) return;
    var lit = candles.length - out;
    counterEl.textContent = lit === 0 ? 'All candles are out' : lit + (lit === 1 ? ' candle still glowing' : ' candles still glowing');
  }

  function lightAll() {
    out = 0;
    candles.forEach(function (c) { c.classList.remove('is-out'); });
    stage.classList.remove('is-out');
    if (againBtn) againBtn.hidden = true;
    if (hintEl) hintEl.classList.remove('is-hidden');
    if (messageEl) messageEl.textContent = '';
    updateCounter();
    if (LWOW.sfx) LWOW.sfx('sparkle');
  }

  function extinguish(candle) {
    if (candle.classList.contains('is-out')) return;
    candle.classList.add('is-out');
    out += 1;
    if (LWOW.sfx) LWOW.sfx('puff');
    if (LWOW.confetti) confetti(22);

    updateCounter();

    if (out === candles.length) {
      // the big moment
      stage.classList.add('is-out');
      if (hintEl) hintEl.classList.add('is-hidden');
      window.setTimeout(function () {
        if (LWOW.confetti) confetti(130);
        if (LWOW.sfx) LWOW.sfx('sparkle');
      }, 320);
      if (messageEl) {
        messageEl.textContent = LWOW.get('celebration.candlesOut', '');
      }
      if (againBtn) {
        againBtn.hidden = false;
        window.setTimeout(function () { againBtn.focus({ preventScroll: true }); }, 500);
      }
      if (navigator.vibrate) {
        try { navigator.vibrate([12, 60, 24]); } catch (err) { /* ignore */ }
      }
    }
  }

  Cake.init = function () {
    stage = LWOW.qs('[data-cake-stage]');
    if (!stage) return;
    var candlesCfg = Number(LWOW.get('celebration.cakeCandles', 5)) || 5;

    if (LWOW.art && LWOW.art.cake) {
      stage.querySelector('[data-cake]').innerHTML = LWOW.art.cake({ candles: candlesCfg });
    }

    svgHost = stage.querySelector('svg');
    hintEl = LWOW.qs('[data-cake-hint]');
    messageEl = LWOW.qs('[data-cake-message]');
    againBtn = LWOW.qs('[data-cake-again]');
    counterEl = LWOW.qs('[data-candle-counter]');

    if (svgHost) {
      candles = Array.prototype.slice.call(svgHost.querySelectorAll('.candle'));
      candles.forEach(function (candle) {
        candle.setAttribute('tabindex', '0');
        candle.setAttribute('role', 'button');
        var idx = Number(candle.getAttribute('data-candle')) + 1;
        candle.setAttribute('aria-label', 'Candle ' + idx + ' — tap to blow it out');
        var activate = function () {
          if (candle.classList.contains('is-out')) return;
          extinguish(candle);
          candle.setAttribute('aria-label', 'Candle ' + idx + ' — out');
        };
        candle.addEventListener('click', function (event) {
          // Several candles share one <svg>; always extinguish the candle that
          // was really tapped, even if a neighbouring group caught the click.
          var owner = event.target.closest ? event.target.closest('.candle') : null;
          extinguish(owner || candle);
          (owner || candle).setAttribute('aria-label', 'Candle ' + idx + ' — out');
        });
        candle.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
          }
        });
      });
    }

    if (againBtn) {
      againBtn.addEventListener('click', lightAll);
    }

    if (LWOW.art && LWOW.art.clouds) {
      var balloonHost = LWOW.qs('[data-balloons]');
      if (balloonHost) spawnBalloons(balloonHost);
    }

    updateCounter();

    // A little welcome sparkle when the page settles.
    window.setTimeout(function () { if (LWOW.confetti) confetti(26); }, 900);
  };

  /* Soft pastel balloons drift up behind the cake. */
  function spawnBalloons(host) {
    if (reduced()) return;
    var palette = [
      ['#F9C6D8', '#E7A6C2'], ['#E7D8FA', '#C0A8E8'], ['#FFF0CF', '#F3CE86'],
      ['#FBDCE6', '#EBB0C8'], ['#DDF0E4', '#A9CFB9']
    ];
    var count = LWOW.isLowPower() ? 4 : 6;
    for (var i = 0; i < count; i++) {
      var b = document.createElement('div');
      b.className = 'balloon';
      b.setAttribute('aria-hidden', 'true');
      var pair = palette[i % palette.length];
      b.style.setProperty('--x', (6 + Math.random() * 86).toFixed(1) + '%');
      b.style.setProperty('--size', (34 + Math.random() * 30).toFixed(0) + 'px');
      b.style.setProperty('--b1', pair[0]);
      b.style.setProperty('--b2', pair[1]);
      b.style.setProperty('--dur', (26 + Math.random() * 16).toFixed(1) + 's');
      b.style.setProperty('--delay', (Math.random() * 22).toFixed(1) + 's');
      b.style.setProperty('--drift', ((Math.random() - 0.5) * 120).toFixed(0) + 'px');
      b.style.setProperty('--string', (40 + Math.random() * 50).toFixed(0) + 'px');
      b.innerHTML = '<span class="balloon__body"></span><span class="balloon__string"></span>';
      host.appendChild(b);
    }
  }

  LWOW.cake = Cake;
})();
