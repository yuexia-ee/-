(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 载入动画 ---------- */
  var loader = document.getElementById('loader');
  function finishLoader() {
    if (!loader) return;
    loader.classList.add('is-done');
    document.body.classList.add('is-ready');
    setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 700);
  }
  window.addEventListener('load', function () {
    setTimeout(finishLoader, reduceMotion ? 0 : 900);
  });
  // 兜底：即使资源加载慢，也不要一直卡住
  setTimeout(finishLoader, 3200);

  /* ---------- 猫咪打哈欠 ---------- */
  var heroCat = document.querySelector('.hero-cat');
  if (heroCat) {
    var yawnTimer;
    heroCat.addEventListener('click', function () {
      heroCat.classList.remove('is-yawning');
      void heroCat.offsetWidth;
      heroCat.classList.add('is-yawning');
      clearTimeout(yawnTimer);
      yawnTimer = setTimeout(function () {
        heroCat.classList.remove('is-yawning');
      }, 1900);
    });
  }

  /* ---------- 滚动进度 ---------- */
  var fill = document.getElementById('progressFill');
  var ticking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (fill) fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- 滚动入场 ---------- */
  var revealItems = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var siblings = [].slice.call(el.parentNode.children).filter(function (n) {
            return n.classList && n.classList.contains('reveal');
          });
          var index = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = Math.min(index * 90, 360) + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 导航高亮 ---------- */
  var links = [].slice.call(document.querySelectorAll('.nav-link'));
  var sections = links.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });

    window.addEventListener('scroll', function () {
      if (window.scrollY < 120) {
        links.forEach(function (l) { l.classList.remove('is-active'); });
      }
    }, { passive: true });
  }

  /* ---------- 复制邮箱 ---------- */
  var copyBtn = document.getElementById('copyEmail');
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1900);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      copyText(copyBtn.getAttribute('data-email') || 'thatxiayue@gmail.com')
        .then(function () { showToast('邮箱已复制：thatxiayue@gmail.com'); })
        .catch(function () { showToast('复制失败，请手动选中邮箱'); });
    });
  }

  /* ---------- 图片/链接外链安全 ---------- */
  [].slice.call(document.querySelectorAll('a[target="_blank"]')).forEach(function (a) {
    if (!a.rel) a.rel = 'noopener';
  });

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
