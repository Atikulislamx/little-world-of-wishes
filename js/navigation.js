/* ==========================================================================
   Little World of Wishes — navigation.js
   Shared navigation behaviour: locking the world again, replay buttons,
   the journey map, keyboard affordances and safe back/forward handling.
   ========================================================================== */
(function () {
  'use strict';

  var LWOW = (window.LWOW = window.LWOW || {});
  var Nav = {};

  function confirmDialog(message) {
    // Use the native dialog where it exists, otherwise fall back to confirm().
    return new Promise(function (resolve) {
      if (typeof window.HTMLDialogElement === 'undefined') {
        resolve(window.confirm(message));
        return;
      }
      var dlg = document.createElement('dialog');
      dlg.className = 'modal';
      dlg.setAttribute('aria-labelledby', 'lock-dialog-title');
      dlg.innerHTML =
        '<div class="modal__frame" style="text-align:center">' +
        '<h2 class="modal__title" id="lock-dialog-title">Lock the little world?</h2>' +
        '<p class="modal__body">' + LWOW.esc(message) + '</p>' +
        '<div class="modal__actions">' +
        '<button class="btn btn--ghost" type="button" data-no>Stay</button>' +
        '<button class="btn btn--primary" type="button" data-yes>Lock the world</button>' +
        '</div></div>';
      document.body.appendChild(dlg);
      dlg.addEventListener('close', function () {
        var value = dlg.returnValue === 'yes';
        if (LWOW.closeModal) LWOW.closeModal(dlg);
        dlg.remove();
        resolve(value);
      });
      dlg.querySelector('[data-no]').addEventListener('click', function () {
        dlg.returnValue = 'no';
        dlg.close();
      });
      dlg.querySelector('[data-yes]').addEventListener('click', function () {
        dlg.returnValue = 'yes';
        dlg.close();
      });
      dlg.addEventListener('cancel', function () { dlg.returnValue = 'no'; });
      if (LWOW.openModal) LWOW.openModal(dlg);
      else dlg.showModal();
    });
  }
  Nav.confirm = confirmDialog;

  Nav.init = function () {
    // lock the little world again
    LWOW.qsa('[data-lock]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        confirmDialog(LWOW.get('ui.lockConfirm', 'Lock the little world again?')).then(function (yes) {
          if (!yes) return;
          LWOW.lock();
          try {
            sessionStorage.removeItem('lwow.promptSeen');
            sessionStorage.removeItem('lwow.musicPos');
          } catch (err) { /* ignore */ }
          if (LWOW.go) LWOW.go('index.html');
          else location.href = 'index.html';
        });
      });
    });

    // replay / restart
    LWOW.qsa('[data-replay]').forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        if (LWOW.sfx) LWOW.sfx('sparkle');
        if (LWOW.go) LWOW.go('welcome.html');
        else location.href = 'welcome.html';
      });
    });

    LWOW.qsa('[data-restart]').forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        if (LWOW.go) LWOW.go('index.html');
        else location.href = 'index.html';
      });
    });

    // The gate should be honest about an existing session.
    var resume = LWOW.qs('[data-resume]');
    if (resume) {
      if (LWOW.isUnlocked()) {
        resume.hidden = false;
        resume.addEventListener('click', function (event) {
          event.preventDefault();
          if (LWOW.go) LWOW.go('welcome.html');
          else location.href = 'welcome.html';
        });
      } else {
        resume.hidden = true;
      }
    }

    // Left/right arrows move through the journey when focus is not in a field.
    var journey = LWOW.get('journey', []);
    var here = journey.map(function (p) { return p.file; }).indexOf(LWOW.currentFile());
    document.addEventListener('keydown', function (event) {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;
      if (document.querySelector('dialog[open]')) return;
      // the gate is never skipped with a key press
      if (here <= 0) return;
      var target = event.key === 'ArrowRight' ? journey[here + 1] : journey[here - 1];
      if (!target) return;
      event.preventDefault();
      if (LWOW.go) LWOW.go(target.file);
      else location.href = target.file;
    });

    // A friendly nudge when someone uses a stale bookmark.
    // The gate and the public "quiet detour" page are never bounced.
    var pageNow = LWOW.pageId();
    if (pageNow !== 'gate' && pageNow !== 'notfound' && !LWOW.isUnlocked()) {
      location.replace('index.html');
    }
  };

  LWOW.nav = Nav;
})();
