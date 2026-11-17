/* ==========================================================================
   Little World of Wishes — guard.js
   Loaded synchronously in <head> after config.js, before anything paints.

   • If a protected page is opened without an unlocked session, the visitor is
     sent back to the Secret Gate.
   • Provides LWOWStore: sessionStorage with an in-memory + window.name
     fallback so the gate still works when storage is blocked (private mode)
     or when the site is opened straight from disk with file://.

   This is an aesthetic gate, not real security — see README.
   ========================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('js');

  var config = window.LWOW_CONFIG;
  if (!config) return;

  /* ----------------------------------------------------------- storage */
  var memory = {};
  var canSession = true;
  try {
    window.sessionStorage.setItem('lwow.probe', '1');
    window.sessionStorage.removeItem('lwow.probe');
  } catch (err) {
    canSession = false;
  }

  function nameToken() {
    try {
      return window.name.indexOf('lwow:') === 0 ? window.name : '';
    } catch (err) {
      return '';
    }
  }

  var Store = {
    get: function (key) {
      if (canSession) {
        try {
          var v = window.sessionStorage.getItem(key);
          if (v !== null) return v;
        } catch (err) { /* ignore */ }
      }
      if (key in memory) return memory[key];
      var token = nameToken();
      if (token === 'lwow:unlocked' && key === config.pin.storageKey) return '1';
      return null;
    },
    set: function (key, value) {
      memory[key] = value;
      if (canSession) {
        try {
          window.sessionStorage.setItem(key, value);
          return;
        } catch (err) { canSession = false; }
      }
      // last resort: window.name survives same-tab navigation in every browser
      try {
        window.name = value === '1' && key === config.pin.storageKey ? 'lwow:unlocked' : window.name;
      } catch (err) { /* ignore */ }
    },
    remove: function (key) {
      delete memory[key];
      if (canSession) {
        try { window.sessionStorage.removeItem(key); } catch (err) { /* ignore */ }
      }
      try {
        if (window.name === 'lwow:unlocked') window.name = '';
      } catch (err) { /* ignore */ }
    }
  };

  window.LWOWStore = Store;

  /* ------------------------------------------------------------- guard */
  // The audio host frame must never be redirected.
  if (html.getAttribute('data-audio-host') === 'true') return;

  var page = html.getAttribute('data-page');
  // The gate and the 404 page are public; everything inside the journey is not.
  var protectedPage = page && page !== 'gate' && page !== 'notfound';
  if (!protectedPage) return;

  function locked() {
    return Store.get(config.pin.storageKey) !== '1';
  }

  window.LWOWGuard = { locked: locked };

  if (locked()) location.replace('index.html');

  // After a soft page swap the internal pages must still respect the gate.
  document.addEventListener('lwow:page', function (event) {
    var p = event.detail && event.detail.page;
    if (p && p !== 'gate' && p !== 'notfound' && locked()) location.replace('index.html');
  });
})();
