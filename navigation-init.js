(function () {
  'use strict';
  var entries = performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
  var isHistoryReturn = entries.length ? entries[0].type === 'back_forward' :
    performance.navigation && performance.navigation.type === 2;
  if (window.location.hash || isHistoryReturn) {
    document.documentElement.classList.add('skip-cover', 'restoring-section');
    window.addEventListener('pageshow', function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          document.documentElement.classList.remove('restoring-section');
        });
      });
    });
  }
})();