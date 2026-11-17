/* ==========================================================================
   Little World of Wishes — music.js
   Background music + tiny UI sound effects.

   Music never autoplays: it starts only after a real tap and the default is
   off. The preference and playback position survive page changes — and when
   the visitor moves between pages through the soft router the audio element is
   never reloaded, so the soundtrack simply keeps playing.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var get = function (path, fallback) { return LWOW.get ? LWOW.get(path, fallback) : fallback; };

  var Music = {};
  var PREF_KEY = 'lwow.audio';
  var POS_KEY = 'lwow.musicPos';
  var PROMPT_KEY = 'lwow.promptSeen';

  var el = null;
  var playing = false;
  var wantsPlay = false;
  var starting = false;
  var volume = 0.38;
  var fadeMs = 2600;
  var fadeOutMs = 700;
  var buttons = [];
  var broken = false;
  var listeners = [];

  /* --------------------------------------------------------- preference */
  function readPref() {
    var pref = { music: false, sound: true };
    try {
      var raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        pref.music = parsed.music === true;
        pref.sound = parsed.sound !== false;
      }
    } catch (err) { /* storage blocked: keep defaults */ }
    return pref;
  }

  function writePref() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(pref)); } catch (err) { /* ignore */ }
  }

  var pref = readPref();

  function readPos() {
    try { return parseFloat(sessionStorage.getItem(POS_KEY)) || 0; } catch (err) { return 0; }
  }
  function writePos() {
    try { sessionStorage.setItem(POS_KEY, String(el && el.currentTime ? el.currentTime : 0)); } catch (err) { /* ignore */ }
  }

  /* --------------------------------------------------------- audio element */
  function ensureEl() {
    if (el) return el;
    var cfg = get('audio', {}) || {};
    el = document.createElement('audio');
    el.preload = 'metadata';
    el.loop = cfg.loop !== false;
    el.volume = 0;
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-lwow-music', 'true');
    el.src = LWOW.asset ? LWOW.asset(cfg.src || 'assets/music/petals-at-dusk.mp3') : (cfg.src || 'assets/music/petals-at-dusk.mp3');

    el.addEventListener('playing', function () { setPlaying(true); });
    el.addEventListener('pause', function () {
      if (starting) return;
      setPlaying(false);
    });
    el.addEventListener('ended', function () { setPlaying(false); });
    el.addEventListener('error', function () { onAudioError(); });
    el.addEventListener('timeupdate', function () {
      if (el.currentTime % 4 < 0.3) writePos();
    });

    document.body.appendChild(el);
    window.addEventListener('pagehide', writePos);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) writePos();
    });
    return el;
  }

  function onAudioError() {
    wantsPlay = false;
    starting = false;
    broken = true;
    setPlaying(false);
    // the button would be a dead end — make that visible instead
    buttons.forEach(disableButton);
    if (onAudioError.warned) return;
    onAudioError.warned = true;
    LWOW.toast(LWOW.get('ui.musicError', 'The soundtrack could not be loaded — everything else works as usual.'));
  }

  /* ---------------------------------------------------------------- fades */
  function fadeTo(target, ms, done) {
    if (!el) { if (done) done(); return; }
    var from = el.volume;
    var duration = Math.max(140, ms || 600);
    if (Math.abs(from - target) < 0.005) {
      el.volume = target;
      if (done) done();
      return;
    }
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    function tick(now) {
      var t = Math.min(1, (now - t0) / duration);
      var eased = t * t * (3 - 2 * t);
      if (el) el.volume = Math.max(0, Math.min(1, from + (target - from) * eased));
      if (t < 1) window.requestAnimationFrame(tick);
      else if (done) done();
    }
    window.requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------ playback */
  function startPlayback() {
    ensureEl();
    wantsPlay = true;
    starting = true;
    try {
      var pos = readPos();
      if (pos > 0 && (!el.duration || pos < el.duration - 2)) el.currentTime = pos;
    } catch (err) { /* ignore */ }

    var attempt;
    try { attempt = el.play(); } catch (err) { attempt = null; }

    if (attempt && typeof attempt.then === 'function') {
      attempt.then(function () {
        starting = false;
        fadeTo(volume, fadeMs);
        setPlaying(true);
      }).catch(function () {
        starting = false;
        setPlaying(false);
        wantsPlay = false;
        pref.music = false;
        writePref();
        syncButtons();
        if (!document.hidden) LWOW.toast('Tap the music button to start the soundtrack.');
      });
    } else {
      starting = false;
      fadeTo(volume, fadeMs);
      setPlaying(true);
    }
  }

  function stopPlayback() {
    wantsPlay = false;
    starting = false;
    if (!el) { setPlaying(false); return; }
    fadeTo(0, fadeOutMs, function () {
      if (!el || starting) return;
      try { el.pause(); } catch (err) { /* ignore */ }
      setPlaying(false);
    });
  }

  function setPlaying(state) {
    playing = !!state;
    buttons.forEach(syncButton);
    document.documentElement.classList.toggle('music-playing', playing);
    listeners.forEach(function (fn) {
      try { fn(playing); } catch (err) { /* ignore */ }
    });
  }

  /* ------------------------------------------------------------- controls */
  function disableButton(btn) {
    if (!btn) return;
    var label = get('ui.musicUnavailable', 'Soundtrack unavailable');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  function syncButton(btn) {
    if (!btn) return;
    if (broken) { disableButton(btn); return; }
    var wrap = btn.closest('.audio-wrap') || btn.parentElement;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    var label = playing ? get('ui.musicOff', 'Turn music off') : get('ui.musicOn', 'Turn music on');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    if (wrap) wrap.classList.toggle('is-playing', playing);
    var glyph = btn.querySelector('[data-music-glyph]');
    if (glyph) glyph.innerHTML = LWOW.icon(playing ? 'sound' : 'musicOff') || '';
  }

  function syncButtons() {
    buttons.forEach(syncButton);
    var soundBtn = document.querySelector('[data-sound-toggle]');
    if (soundBtn) {
      soundBtn.setAttribute('aria-pressed', pref.sound ? 'true' : 'false');
      var label = pref.sound ? get('ui.soundOff', 'Turn sounds off') : get('ui.soundOn', 'Turn sounds on');
      soundBtn.setAttribute('aria-label', label);
      soundBtn.setAttribute('title', label);
      var glyph = soundBtn.querySelector('[data-sound-glyph]');
      if (glyph) glyph.innerHTML = LWOW.icon(pref.sound ? 'sound' : 'soundOff') || '';
    }
  }

  function toggleMusic(force) {
    var next = typeof force === 'boolean' ? force : !playing;
    pref.music = next;
    writePref();
    if (next) startPlayback();
    else stopPlayback();
    syncButtons();
    return next;
  }

  function toggleSound(force) {
    pref.sound = typeof force === 'boolean' ? force : !pref.sound;
    writePref();
    syncButtons();
    if (pref.sound) sfx('tap');
    return pref.sound;
  }

  Music.toggle = toggleMusic;
  Music.toggleSound = toggleSound;
  Music.isPlaying = function () { return playing; };
  Music.soundEnabled = function () { return pref.sound; };
  Music.wantsMusic = function () { return pref.music; };
  Music.volumeUp = function () { if (el && wantsPlay) fadeTo(volume, 900); };
  Music.volumeDown = function () { if (el) fadeTo(volume * 0.45, 500); };
  Music.on = function (fn) { listeners.push(fn); fn(playing); };

  /* ------------------------------------------------------- music prompt */
  Music.prompt = function () {
    if (LWOW.pageId && LWOW.pageId() === 'gate') return;
    var seen = false;
    try { seen = sessionStorage.getItem(PROMPT_KEY) === '1'; } catch (err) { /* ignore */ }
    if (seen || pref.music || playing) return;
    if (document.querySelector('.music-prompt')) return;
    try { sessionStorage.setItem(PROMPT_KEY, '1'); } catch (err) { /* ignore */ }

    var box = document.createElement('div');
    box.className = 'music-prompt';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Background music');
    box.innerHTML =
      '<span class="music-prompt__icon">' + LWOW.icon('music') + '</span>' +
      '<span class="music-prompt__text"><strong>Add a little music?</strong>' +
      '<span>Optional — soft and calm, off by default.</span></span>' +
      '<span class="music-prompt__actions">' +
      '<button class="music-prompt__btn music-prompt__btn--primary" type="button" data-prompt-yes>Play</button>' +
      '<button class="music-prompt__btn music-prompt__btn--quiet" type="button" data-prompt-no>Not now</button>' +
      '</span>' +
      '<button class="music-prompt__close" type="button" data-prompt-close aria-label="Dismiss">' + LWOW.icon('close') + '</button>';

    document.body.appendChild(box);
    window.requestAnimationFrame(function () { box.classList.add('is-visible'); });

    var close = function () {
      box.classList.remove('is-visible');
      window.setTimeout(function () { box.remove(); }, 560);
    };

    box.querySelector('[data-prompt-yes]').addEventListener('click', function () {
      toggleMusic(true);
      close();
    });
    box.querySelector('[data-prompt-no]').addEventListener('click', close);
    box.querySelector('[data-prompt-close]').addEventListener('click', close);
    window.setTimeout(function () {
      if (document.body.contains(box) && !playing) close();
    }, 17000);
  };

  /* ------------------------------------------------------------- sounds */
  var sfxCtx = null;
  var sfxMaster = null;

  function ensureSfx() {
    if (!pref.sound) return null;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!sfxCtx) {
      try {
        sfxCtx = new Ctx();
        sfxMaster = sfxCtx.createGain();
        sfxMaster.gain.value = 0.14;
        sfxMaster.connect(sfxCtx.destination);
      } catch (err) { return null; }
    }
    if (sfxCtx.state === 'suspended') sfxCtx.resume().catch(function () { /* ignore */ });
    return sfxCtx;
  }

  function tone(ctx, opts) {
    var t0 = opts.start || ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(opts.gain || 0.2, t0 + (opts.attack || 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(sfxMaster);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  var SFX = {
    tap: function (ctx, t) {
      tone(ctx, { freq: 660, to: 880, dur: 0.16, gain: 0.14, start: t });
      tone(ctx, { freq: 1320, dur: 0.1, gain: 0.05, start: t + 0.02 });
    },
    key: function (ctx, t) {
      tone(ctx, { freq: 520, to: 640, dur: 0.09, gain: 0.1, start: t, type: 'triangle' });
    },
    error: function (ctx, t) {
      tone(ctx, { freq: 300, to: 190, dur: 0.3, gain: 0.16, start: t, type: 'triangle' });
      tone(ctx, { freq: 224, to: 150, dur: 0.34, gain: 0.1, start: t + 0.06 });
    },
    unlock: function (ctx, t) {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone(ctx, { freq: f, dur: 1.5, gain: 0.14, start: t + i * 0.1 });
        tone(ctx, { freq: f * 2, dur: 0.9, gain: 0.04, start: t + i * 0.1 + 0.01 });
      });
    },
    bloom: function (ctx, t) {
      [784, 1046.5, 1318.5].forEach(function (f, i) {
        tone(ctx, { freq: f, dur: 0.7, gain: 0.09, start: t + i * 0.055, type: 'triangle' });
      });
    },
    puff: function (ctx, t) {
      var size = Math.floor(ctx.sampleRate * 0.38);
      var buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < size; i++) {
        var fade = 1 - i / size;
        data[i] = (Math.random() * 2 - 1) * fade * fade;
      }
      var src = ctx.createBufferSource();
      src.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(420, t + 0.36);
      filter.Q.value = 0.9;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
      src.connect(filter);
      filter.connect(g);
      g.connect(sfxMaster);
      src.start(t);
      src.stop(t + 0.4);
    },
    sparkle: function (ctx, t) {
      [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) {
        tone(ctx, { freq: f, dur: 1.1, gain: 0.055, start: t + i * 0.07 });
      });
    },
    pop: function (ctx, t) {
      tone(ctx, { freq: 420, to: 900, dur: 0.18, gain: 0.14, start: t });
      tone(ctx, { freq: 1200, to: 1700, dur: 0.12, gain: 0.06, start: t + 0.04 });
    },
    firework: function (ctx, t) {
      SFX.pop(ctx, t);
      [1046.5, 1318.5, 1760, 2093, 2637].forEach(function (f, i) {
        tone(ctx, { freq: f, dur: 0.85, gain: 0.045, start: t + 0.05 + i * 0.05 });
      });
    }
  };

  function sfx(name) {
    if (!pref.sound) return;
    var ctx = ensureSfx();
    if (!ctx || !SFX[name]) return;
    try { SFX[name](ctx, ctx.currentTime + 0.005); } catch (err) { /* ignore */ }
  }
  Music.sfx = sfx;
  LWOW.sfx = sfx;

  /* ---------------------------------------------------------------- init */
  Music.init = function () {
    if (el && !document.body.contains(el)) {
      var keeper = document.getElementById('lwow-audio-keeper');
      if (keeper) keeper.appendChild(el);
    }
    var cfg = get('audio', {}) || {};
    volume = typeof cfg.volume === 'number' ? cfg.volume : 0.38;
    fadeMs = cfg.fadeInMs || 2600;
    fadeOutMs = cfg.fadeOutMs || 700;

    buttons = Array.prototype.slice.call(document.querySelectorAll('[data-music-toggle]'));
    if (broken) buttons.forEach(disableButton);
    if (cfg.enabled === false) {
      buttons.forEach(function (btn) {
        var group = btn.closest('.audio-group');
        if (group) group.hidden = true;
      });
      return;
    }

    buttons.forEach(function (btn) {
      syncButton(btn);
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        toggleMusic();
      });
    });

    var soundBtn = document.querySelector('[data-sound-toggle]');
    if (soundBtn) {
      soundBtn.addEventListener('click', function (event) {
        event.preventDefault();
        toggleSound();
      });
    }
    syncButtons();

    // Coming back to the site with music already chosen: pick up where it left
    // off. (A gesture may be required by the browser — the UI stays honest.)
    if (pref.music && !Music.resumedOnce) {
      Music.resumedOnce = true;
      window.setTimeout(function () {
        if (!playing) startPlayback();
      }, 350);
    }

    window.setTimeout(function () {
      Music.prompt();
    }, 2600);

    document.addEventListener('visibilitychange', function () {
      if (!el) return;
      if (!document.hidden && wantsPlay && el.paused) {
        var p = el.play();
        if (p && p.catch) p.catch(function () { /* ignore */ });
      }
      if (sfxCtx) {
        if (document.hidden) sfxCtx.suspend().catch(function () {});
        else sfxCtx.resume().catch(function () {});
      }
    });

    // the soft router keeps the element alive; this only refreshes the chrome
    Music.refresh = function () {
      buttons = Array.prototype.slice.call(document.querySelectorAll('[data-music-toggle]'));
      buttons.forEach(function (btn) {
        syncButton(btn);
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function (event) {
          event.preventDefault();
          toggleMusic();
        });
      });
      var sb = document.querySelector('[data-sound-toggle]');
      if (sb && sb.dataset.bound !== 'true') {
        sb.dataset.bound = 'true';
        sb.addEventListener('click', function (event) {
          event.preventDefault();
          toggleSound();
        });
      }
      syncButtons();
    };
  };

  window.addEventListener('storage', function (event) {
    if (event.key !== PREF_KEY) return;
    pref = readPref();
    syncButtons();
  });

  LWOW.music = Music;
})();
