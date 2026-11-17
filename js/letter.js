/* ==========================================================================
   Little World of Wishes — letter.js
   The sealed envelope that opens into a handwritten-style letter.
   All copy comes from config.letter — nothing is hard-coded here.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Letter = {};
  var stage, envelope, sheet, openBtn, closeBtn, body, sign, opened = false;

  function buildSheet() {
    if (!sheet || sheet.dataset.built === 'true') return;
    sheet.dataset.built = 'true';

    var paragraphs = LWOW.get('letter.paragraphs', []);
    var salutation = LWOW.get('letter.salutation', '');
    var signature = LWOW.get('letter.signature', '');
    var postscript = LWOW.get('letter.postscript', '');

    var html = '';
    html += '<header class="letter-sheet__head">';
    html += '<h2 class="script-accent" data-letter-salutation>' + LWOW.esc(salutation) + '</h2>';
    html += '<div class="letter-sheet__stamp" aria-hidden="true">' + LWOW.icon('flower') + '</div>';
    html += '</header>';
    html += '<div class="letter-sheet__body">';
    paragraphs.forEach(function (text, i) {
      html += '<p class="letter-line' + (i === 0 ? ' dropcap' : '') + '" style="--reveal-delay:' + (i * 120) + 'ms">' +
        LWOW.esc(text) + '</p>';
    });
    html += '</div>';
    html += '<div class="letter-sheet__sign">';
    html += '<span class="hand">' + LWOW.esc(signature) + '</span>';
    html += '<small data-bind-text="letter.postscript">' + LWOW.esc(postscript) + '</small>';
    html += '</div>';

    body = LWOW.qs('[data-letter-body]', sheet) || sheet;
    body.innerHTML = html;

    if (LWOW.art && LWOW.art.sprig) {
      var decoTl = document.createElement('div');
      decoTl.className = 'letter-sheet__deco letter-sheet__deco--tl';
      decoTl.setAttribute('aria-hidden', 'true');
      decoTl.innerHTML = LWOW.art.sprig(1);
      sheet.appendChild(decoTl);
      var decoBr = document.createElement('div');
      decoBr.className = 'letter-sheet__deco letter-sheet__deco--br';
      decoBr.setAttribute('aria-hidden', 'true');
      decoBr.innerHTML = LWOW.art.sprig(1);
      sheet.appendChild(decoBr);
    }
  }

  function revealLines() {
    var lines = LWOW.qsa('.letter-sheet__body .letter-line', sheet);
    var reduced = LWOW.prefersReducedMotion();
    lines.forEach(function (line, i) {
      if (reduced) {
        line.classList.add('is-in');
        return;
      }
      window.setTimeout(function () {
        line.classList.add('is-in');
        if (i === 1 && LWOW.sfx) LWOW.sfx('sparkle');
      }, 220 + i * 170);
    });
  }

  function open() {
    if (opened || !stage) return;
    opened = true;
    buildSheet();

    stage.classList.add('is-open');
    if (envelope) envelope.classList.add('is-open');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'true');
      openBtn.hidden = true;
    }

    if (LWOW.sfx) LWOW.sfx('bloom');

    window.setTimeout(function () {
      sheet.classList.add('is-visible');
      sheet.setAttribute('aria-hidden', 'false');
      revealLines();
      if (closeBtn) closeBtn.hidden = false;
      sheet.scrollIntoView({ behavior: LWOW.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      if (closeBtn) window.setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 600);
    }, LWOW.prefersReducedMotion() ? 40 : 780);
  }

  function fold() {
    if (!opened) return;
    opened = false;
    stage.classList.remove('is-open');
    if (envelope) envelope.classList.remove('is-open');
    sheet.classList.remove('is-visible');
    sheet.setAttribute('aria-hidden', 'true');
    if (openBtn) {
      openBtn.hidden = false;
      openBtn.setAttribute('aria-expanded', 'false');
      window.setTimeout(function () { openBtn.focus({ preventScroll: true }); }, 350);
    }
    if (closeBtn) closeBtn.hidden = true;
    LWOW.qsa('.letter-line', sheet).forEach(function (l) { l.classList.remove('is-in'); });
  }

  Letter.init = function () {
    stage = LWOW.qs('[data-letter-stage]');
    if (!stage) return;
    envelope = stage.querySelector('[data-envelope]');
    sheet = stage.querySelector('[data-letter-sheet]');
    openBtn = LWOW.qs('[data-letter-open]');
    closeBtn = LWOW.qs('[data-letter-close]');
    Letter.open = open;
    Letter.close = fold;

    if (sheet) sheet.setAttribute('aria-hidden', 'true');

    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.setAttribute('aria-controls', 'letter-sheet');
      openBtn.addEventListener('click', open);
    }
    if (closeBtn) {
      closeBtn.hidden = true;
      closeBtn.addEventListener('click', fold);
    }
    if (envelope) {
      envelope.addEventListener('click', open);
      envelope.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    }

    // butterflies drifting over the stationery
    if (!LWOW.prefersReducedMotion() && LWOW.art && LWOW.art.butterfly) {
      var host = LWOW.qs('[data-letter-butterflies]');
      if (host) {
        var hues = ['rose', 'lilac', 'gold'];
        [0, 1, 2].forEach(function (i) {
          var b = document.createElement('div');
          b.className = 'butterfly';
          b.setAttribute('aria-hidden', 'true');
          b.style.setProperty('--size', (30 + i * 8) + 'px');
          b.style.setProperty('--dur', (24 + i * 7) + 's');
          b.style.setProperty('--delay', (i * 4) + 's');
          b.style.setProperty('--from-x', '-12vw');
          b.style.setProperty('--from-y', (48 + i * 8) + 'vh');
          b.style.setProperty('--mid1-x', '26vw');
          b.style.setProperty('--mid1-y', (30 + i * 6) + 'vh');
          b.style.setProperty('--mid2-x', '56vw');
          b.style.setProperty('--mid2-y', (44 + i * 4) + 'vh');
          b.style.setProperty('--mid3-x', '84vw');
          b.style.setProperty('--mid3-y', (24 + i * 7) + 'vh');
          b.style.setProperty('--to-x', '112vw');
          b.style.setProperty('--to-y', (36 + i * 5) + 'vh');
          b.innerHTML = '<div class="butterfly__wings">' + LWOW.art.butterfly({ hue: hues[i] }) + '</div>';
          host.appendChild(b);
        });
      }
    }
  };

  LWOW.letter = Letter;
})();
