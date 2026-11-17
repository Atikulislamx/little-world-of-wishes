/* ==========================================================================
   Little World of Wishes — finale.js
   The closing page: a quiet wish on a star, then two ways to keep going.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Finale = {};
  var wishStar, thanksEl, hintEl, sent = false;

  function makeStars() {
    var host = LWOW.qs('[data-finale-stars]');
    if (!host || LWOW.prefersReducedMotion()) return;
    var count = LWOW.isLowPower() ? 26 : LWOW.isCoarse() ? 34 : 54;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'sky-star';
      s.setAttribute('aria-hidden', 'true');
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.top = (Math.random() * 80).toFixed(2) + '%';
      s.style.setProperty('--size', (1.4 + Math.random() * 2.6).toFixed(1) + 'px');
      s.style.setProperty('--dur', (3 + Math.random() * 5).toFixed(1) + 's');
      s.style.setProperty('--delay', (Math.random() * 6).toFixed(1) + 's');
      frag.appendChild(s);
    }
    host.appendChild(frag);
  }

  function sendWish() {
    if (sent) return;
    sent = true;
    wishStar.classList.add('is-sent');
    wishStar.setAttribute('aria-disabled', 'true');
    if (LWOW.sfx) LWOW.sfx('sparkle');
    if (thanksEl) {
      thanksEl.textContent = LWOW.get('finale.starWishThanks', 'Your wish is on its way.');
      thanksEl.classList.add('is-visible');
    }
    if (hintEl) hintEl.hidden = true;

    if (LWOW.prefersReducedMotion()) return;
    var layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    var colors = ['#FFF4D6', '#F9D9E4', '#DCCCF5', '#C7E7DA'];
    for (var i = 0; i < (LWOW.isLowPower() ? 20 : 36); i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece confetti-piece--petal';
      p.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      p.style.setProperty('--w', (5 + Math.random() * 5).toFixed(1) + 'px');
      p.style.setProperty('--h', (8 + Math.random() * 6).toFixed(1) + 'px');
      p.style.setProperty('--c', colors[i % colors.length]);
      p.style.setProperty('--sway', ((Math.random() - 0.5) * 180).toFixed(0) + 'px');
      p.style.setProperty('--dur', (4 + Math.random() * 2.6).toFixed(2) + 's');
      p.style.setProperty('--delay', (Math.random() * 0.8).toFixed(2) + 's');
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    window.setTimeout(function () { layer.remove(); }, 8000);
  }

  function makeWishStar() {
    var host = LWOW.qs('[data-wish-star-host]');
    if (!host || host.querySelector('.sky-star--wish')) return;
    wishStar = document.createElement('button');
    wishStar.type = 'button';
    wishStar.style.width = '44px';
    wishStar.style.height = '44px';
    wishStar.style.display = 'grid';
    wishStar.style.placeItems = 'center';
    wishStar.style.background = 'transparent';
    wishStar.style.border = '0';
    wishStar.style.cursor = 'pointer';
    wishStar.className = 'sky-star sky-star--wish';
    wishStar.setAttribute('aria-label', LWOW.get('finale.starWishPrompt', 'Send your wish into the sky'));
    wishStar.title = 'Make a wish';
    wishStar.style.left = '50%';
    wishStar.style.top = '18%';
    wishStar.style.marginLeft = '-22px';
    wishStar.addEventListener('click', sendWish);
    host.appendChild(wishStar);
  }

  Finale.init = function () {
    thanksEl = LWOW.qs('[data-wish-thanks]');
    hintEl = LWOW.qs('[data-wish-hint]');
    makeStars();
    makeWishStar();

    // the moon glow drifts gently behind the headline
    var glow = LWOW.qs('.moon-glow');
    if (glow && LWOW.prefersReducedMotion()) glow.style.animation = 'none';

    // a final, quiet sparkle to reward arriving here
    window.setTimeout(function () {
      if (LWOW.confetti) LWOW.confetti(40);
      if (LWOW.sfx) LWOW.sfx('sparkle');
    }, 800);
  };

  LWOW.finale = Finale;
})();
