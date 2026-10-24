(function () {
  'use strict';
  var entries = performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
  var legacyType = performance.navigation && performance.navigation.type;
  var type = entries.length ? entries[0].type : legacyType === 1 ? 'reload' : legacyType === 2 ? 'back_forward' : 'navigate';
  var explicitReturn = false;
  var prefix = 'resume-detail-return:';
  // A one-use, same-tab marker also works for local file previews.
  if (window.name.indexOf(prefix) === 0) {
    try {
      var marker = JSON.parse(window.name.slice(prefix.length));
      window.name = marker.previousName || '';
      explicitReturn = marker.target === window.location.href;
    } catch (error) { window.name = ''; }
  }
  var historyReturn = type === 'back_forward' && history.state && history.state.resumeDetailReturn;
  if (type !== 'reload' && (explicitReturn || historyReturn)) {
    document.documentElement.classList.add('skip-cover', 'restoring-section');
    window.addEventListener('pageshow', function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          document.documentElement.classList.remove('restoring-section');
        });
      });
    });
  } else {
    // A cover entry always starts a fresh visit at the top, not at an old hash.
    history.scrollRestoration = 'manual';
    var freshState = Object.assign({}, history.state);
    delete freshState.resumeDetailReturn;
    try { history.replaceState(freshState, '', window.location.href.split('#')[0]); } catch (error) {}
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    }, {once: true});
  }
})();