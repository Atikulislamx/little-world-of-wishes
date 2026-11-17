/* ==========================================================================
   Little World of Wishes — shell.js
   Builds the shared chrome (top bar + footer) so every one of the eight pages
   carries identical, accessible navigation without duplicated markup.
   The pages keep a <noscript> fallback of their own.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Shell = {};

  function journey() {
    return LWOW.get('journey', []);
  }

  function current() {
    var file = LWOW.currentFile();
    return journey().filter(function (p) { return p.file === file; })[0] || null;
  }

  function neighbour(offset) {
    var list = journey();
    var here = list.map(function (p) { return p.file; }).indexOf(LWOW.currentFile());
    if (here < 0) return null;
    return list[here + offset] || null;
  }

  function iconBtn(attrs, glyph, opts) {
    return '<button class="icon-btn' + (opts && opts.ghost ? ' icon-btn--ghost' : '') + '" type="button" ' +
      attrs + ' title="' + LWOW.esc(attrs.title || '') + '">' +
      '<span class="icon-btn__glyph">' + glyph + '</span></button>';
  }

  function audioGroup() {
    var cfg = LWOW.get('audio', {});
    if (cfg.enabled === false) return '';
    return '' +
      '<div class="audio-group" role="group" aria-label="Sound controls">' +
      '<span class="audio-wrap">' +
      '<button class="icon-btn" type="button" data-music-toggle aria-pressed="false" ' +
      'aria-label="' + LWOW.esc(LWOW.get('ui.musicOn', 'Turn music on')) + '">' +
      '<span class="icon-btn__glyph" data-music-glyph>' + LWOW.icon('musicOff') + '</span>' +
      '<span class="music-bars" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '</button>' +
      '</span>' +
      '<button class="icon-btn" type="button" data-sound-toggle aria-pressed="true" ' +
      'aria-label="' + LWOW.esc(LWOW.get('ui.soundOff', 'Turn sounds off')) + '">' +
      '<span data-sound-glyph>' + LWOW.icon('sound') + '</span>' +
      '</button>' +
      '</div>';
  }

  function buildTopbar() {
    var host = LWOW.qs('[data-topbar]');
    if (!host) return;
    var isGate = LWOW.pageId() === 'gate';
    var lockBtn = !isGate && LWOW.isUnlocked()
      ? iconBtn('data-lock title="' + LWOW.esc(LWOW.get('ui.lockLabel', 'Lock this world')) + '" aria-label="' +
        LWOW.esc(LWOW.get('ui.lockLabel', 'Lock this world')) + '"', LWOW.icon('lock'), { ghost: true })
      : '';

    host.innerHTML =
      '<div class="topbar__inner">' +
      '<a class="brand" href="' + (isGate ? 'index.html' : 'welcome.html') + '" data-nav>' +
      '<span class="brand__mark" aria-hidden="true">' + LWOW.icon('flower') + '</span>' +
      '<span class="brand__name">' + LWOW.esc(LWOW.get('ui.siteName', 'Little World of Wishes')) +
      '<small>' + LWOW.esc(current() ? 'Step ' + current().step : LWOW.get('ui.tagline', '')) + '</small>' +
      '</span></a>' +
      '<div class="topbar__tools">' +
      '<span class="journey" data-journey-dots aria-hidden="true"></span>' +
      audioGroup() +
      lockBtn +
      '</div>' +
      '</div>';
  }

  function buildFooter() {
    var host = LWOW.qs('[data-footer]');
    if (!host) return;
    var isGate = LWOW.pageId() === 'gate';
    var prev = neighbour(-1);
    var here = current();

    var left = isGate
      ? '<span class="page-foot__meta">' + LWOW.esc(LWOW.get('birthday.monthDay', '')) + ' · a little secret</span>'
      : (prev
        ? '<a class="link-quiet btn--back" href="' + prev.file + '" data-nav>' + LWOW.icon('arrowLeft') +
          '<span>' + LWOW.esc(LWOW.get('ui.backLabel', 'Back')) + '</span></a>'
        : '');

    var center = here
      ? '<span class="page-foot__meta" data-journey-label>' + LWOW.esc('Step ' + here.step + ' · ' + here.label) + '</span>'
      : '';

    var right = isGate
      ? '<span class="page-foot__meta">' + LWOW.esc('handpainted') + '</span>'
      : '<a class="link-quiet" href="welcome.html" data-nav>' + LWOW.icon('home') +
        '<span>' + LWOW.esc(LWOW.get('ui.homeLabel', 'Home')) + '</span></a>';

    host.innerHTML =
      '<div class="page-foot__inner">' +
      '<div class="page-foot__side">' + left + '</div>' +
      center +
      '<div class="page-foot__side">' + right + '</div>' +
      '</div>';
  }

  Shell.init = function () {
    buildTopbar();
    buildFooter();
  };

  LWOW.shell = Shell;
})();
