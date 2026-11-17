/* ==========================================================================
   Little World of Wishes — pin-lock.js
   The Secret Gate: a four-digit keypad, gentle error feedback and a soft
   unlocking transition. Purely an aesthetic gate — see README.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Pin = {};
  var code = '1119';
  var length = 4;
  var entry = '';
  var busy = false;
  var attempts = 0;

  var gate, card, dotsHost, hint, unlockBtn, clearBtn, backBtn, liveRegion;

  function setHint(text, state) {
    if (!hint) return;
    hint.textContent = text || '';
    hint.classList.toggle('is-error', state === 'error');
    hint.classList.toggle('is-ok', state === 'ok');
  }

  function announce(text) {
    if (liveRegion) liveRegion.textContent = text;
  }

  function renderDots() {
    if (!dotsHost) return;
    var dots = dotsHost.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-filled', i < entry.length);
    }
    dotsHost.setAttribute('aria-label', entry.length + ' of ' + length + ' digits entered');
  }

  function press(digit) {
    if (busy) return;
    if (entry.length >= length) return;
    entry += digit;
    renderDots();
    if (LWOW.sfx) LWOW.sfx('key');
    setHint('');
    gate.classList.remove('is-error');
    if (entry.length === length) {
      window.setTimeout(function () { verify(); }, 220);
    }
  }

  function backspace() {
    if (busy || !entry.length) return;
    entry = entry.slice(0, -1);
    renderDots();
    if (LWOW.sfx) LWOW.sfx('key');
    setHint('');
  }

  function clear() {
    if (busy) return;
    entry = '';
    renderDots();
    gate.classList.remove('is-error');
    setHint('');
  }

  function verify() {
    if (busy) return;
    if (entry.length !== length) {
      setHint('Please enter all ' + length + ' numbers.', 'error');
      announce('Please enter all ' + length + ' numbers.');
      return;
    }
    if (entry === code) {
      success();
    } else {
      fail();
    }
  }

  function fail() {
    attempts += 1;
    gate.classList.add('is-error');
    card.classList.remove('is-shaking');
    void card.offsetWidth; // restart the animation
    card.classList.add('is-shaking');
    if (LWOW.sfx) LWOW.sfx('error');
    var n = attempts;
    var wrong = ['Not quite — but the flowers are patient.', 'Not this one. Try again, gently.', 'Almost? No hurry at all.'];
    setHint(wrong[(n - 1) % wrong.length], 'error');
    announce('That is not the right PIN. Please try again.');
    window.setTimeout(function () {
      entry = '';
      renderDots();
      gate.classList.remove('is-error');
    }, 620);

    var hintAt = LWOW.get('pin.maxAttemptsHint', 3);
    if (n === hintAt) {
      window.setTimeout(function () {
        setHint('A little clue: the gate opens on a certain day in November.', 'error');
      }, 900);
    }
  }

  function success() {
    busy = true;
    gate.classList.add('is-success');
    if (LWOW.sfx) LWOW.sfx('unlock');
    setHint('Welcome in. The gate is opening for you…', 'ok');
    announce('Correct PIN. Welcome to your little world.');
    LWOW.unlock();

    var bloom = document.createElement('div');
    bloom.className = 'unlock-bloom';
    bloom.setAttribute('aria-hidden', 'true');
    bloom.innerHTML = LWOW.art && LWOW.art.flower
      ? LWOW.art.flower('sakura', { seed: 4, scale: 1.05 })
      : '';
    document.body.appendChild(bloom);

    if (navigator.vibrate) {
      try { navigator.vibrate(18); } catch (err) { /* ignore */ }
    }

    window.setTimeout(function () {
      if (LWOW.pageId() === 'gate' && LWOW.go) LWOW.go('welcome.html');
      else location.href = 'welcome.html';
    }, 1250);
  }

  function buildKeypad() {
    var host = LWOW.qs('[data-keypad]');
    if (!host) return;
    if (host.children.length) return;

    var keys = [
      { k: '1', label: '1' }, { k: '2', label: '2' }, { k: '3', label: '3' },
      { k: '4', label: '4' }, { k: '5', label: '5' }, { k: '6', label: '6' },
      { k: '7', label: '7' }, { k: '8', label: '8' }, { k: '9', label: '9' },
      { k: 'back', label: 'Delete', util: true },
      { k: '0', label: '0' },
      { k: 'clear', label: 'Clear', util: true }
    ];

    keys.forEach(function (key) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'key' + (key.util ? ' key--util' : '');
      if (key.k === 'back') {
        btn.setAttribute('aria-label', 'Delete last digit');
        btn.innerHTML = LWOW.icon('arrowLeft');
      } else if (key.k === 'clear') {
        btn.setAttribute('aria-label', 'Clear all digits');
        btn.textContent = key.label;
      } else {
        btn.setAttribute('aria-label', key.label);
        btn.textContent = key.label;
        btn.setAttribute('inputmode', 'none');
      }
      btn.dataset.key = key.k;
      btn.addEventListener('click', function () {
        if (key.k === 'back') backspace();
        else if (key.k === 'clear') clear();
        else press(key.k);
      });
      host.appendChild(btn);
    });
  }

  Pin.init = function () {
    code = String(LWOW.get('pin.code', '1119'));
    length = Number(LWOW.get('pin.length', code.length)) || code.length;
    gate = LWOW.qs('[data-gate]');
    if (!gate) return;
    card = LWOW.qs('[data-gate-card]');
    dotsHost = LWOW.qs('[data-pin-display]');
    hint = LWOW.qs('[data-gate-hint]');
    unlockBtn = LWOW.qs('[data-unlock]');
    clearBtn = LWOW.qs('[data-gate-clear]');
    liveRegion = LWOW.qs('[data-gate-live]');

    buildKeypad();

    // build the dots to match the configured length
    if (dotsHost) {
      dotsHost.innerHTML = '';
      for (var i = 0; i < length; i++) {
        var dot = document.createElement('span');
        dot.className = 'pin-dot';
        dot.setAttribute('aria-hidden', 'true');
        dotsHost.appendChild(dot);
      }
      renderDots();
    }

    if (unlockBtn) unlockBtn.addEventListener('click', verify);
    if (clearBtn) clearBtn.addEventListener('click', clear);

    // physical keyboard: numbers, backspace, enter, escape
    document.addEventListener('keydown', function (event) {
      if (busy || document.querySelector('dialog[open]')) return;
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        press(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        backspace();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        verify();
      } else if (event.key === 'Escape') {
        clear();
      }
    });

    // restore focus politely (never on touch devices, where it opens a keyboard)
    if (!LWOW.isCoarse()) {
      var firstKey = LWOW.qs('.key', gate);
      if (firstKey) window.setTimeout(function () { firstKey.focus({ preventScroll: true }); }, 900);
    }

    // If the visitor already unlocked in this session, offer a shortcut.
    if (LWOW.isUnlocked()) {
      setHint('Your little world is already unlocked in this tab.', 'ok');
    }
  };

  LWOW.pin = Pin;
})();
