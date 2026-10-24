(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    var home = new URL('../index.html', window.location.href);
    var target = new URL(link.href);
    if (target.origin !== home.origin || target.pathname !== home.pathname) return;
    window.name = 'resume-detail-return:' + JSON.stringify({target: target.href, previousName: window.name});
  });
})();