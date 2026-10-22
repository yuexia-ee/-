(function () {
  'use strict';

  var tracks = (Array.isArray(window.PLAYLIST) ? window.PLAYLIST : [])
    .filter(function (track) { return track && track.src; })
    .map(function (track) {
      return {
        title: String(track.title || '未命名曲目'),
        artist: String(track.artist || '未署名'),
        src: String(track.src),
        duration: track.duration ? String(track.duration) : ''
      };
    });

  var player = document.getElementById('player');
  var audio = document.getElementById('audio');
  var trackList = document.getElementById('trackList');
  var trackEmpty = document.getElementById('trackEmpty');
  var trackCount = document.getElementById('trackCount');
  var trackCountRole = document.getElementById('trackCountRole');
  var nowIndex = document.getElementById('nowIndex');
  var nowTitle = document.getElementById('nowTitle');
  var nowArtist = document.getElementById('nowArtist');
  var seek = document.getElementById('seek');
  var progressFill = document.getElementById('progressFill');
  var progressKnob = document.getElementById('progressKnob');
  var curTime = document.getElementById('curTime');
  var totalTime = document.getElementById('totalTime');
  var prevBtn = document.getElementById('prevBtn');
  var playBtn = document.getElementById('playBtn');
  var nextBtn = document.getElementById('nextBtn');
  var volume = document.getElementById('volume');

  if (!player || !audio) return;

  var current = -1;
  var seeking = false;

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function countLabel(value) {
    return pad(value) + ' 首';
  }

  function formatTime(value) {
    if (!isFinite(value) || value < 0) return '00:00';
    var total = Math.floor(value);
    var hours = Math.floor(total / 3600);
    var minutes = Math.floor((total % 3600) / 60);
    var seconds = total % 60;
    if (hours > 0) return hours + ':' + pad(minutes) + ':' + pad(seconds);
    return pad(minutes) + ':' + pad(seconds);
  }

  function setPlaying(isPlaying) {
    player.classList.toggle('is-playing', isPlaying);
    playBtn.setAttribute('aria-label', isPlaying ? '暂停' : '播放');
  }

  function setControlsEnabled(enabled) {
    prevBtn.disabled = !enabled;
    playBtn.disabled = !enabled;
    nextBtn.disabled = !enabled;
    volume.disabled = !enabled;
    seek.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    seek.tabIndex = enabled ? 0 : -1;
  }

  function updateRows() {
    var rows = trackList.querySelectorAll('.track-row');
    [].forEach.call(rows, function (row) {
      var isActive = Number(row.getAttribute('data-index')) === current;
      row.classList.toggle('is-active', isActive);
      if (isActive) {
        row.setAttribute('aria-current', 'true');
      } else {
        row.removeAttribute('aria-current');
      }
    });
  }

  function updateNow() {
    if (current < 0 || !tracks[current]) return;
    var track = tracks[current];
    nowIndex.textContent = pad(current + 1) + ' / ' + pad(tracks.length);
    nowTitle.textContent = track.title;
    nowArtist.textContent = track.artist;
    totalTime.textContent = track.duration || '00:00';
    updateRows();
    updateMediaSession();
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata !== 'function' || current < 0) return;
    var track = tracks[current];
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: "Oriah's Playlist"
      });
    } catch (error) {
      /* 不支持 Media Session 时保持静默 */
    }
  }

  function updateProgress() {
    var duration = audio.duration;
    var currentTime = audio.currentTime || 0;
    var percent = duration && isFinite(duration) && duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

    progressFill.style.width = percent + '%';
    progressKnob.style.left = percent + '%';
    seek.setAttribute('aria-valuenow', String(Math.round(percent)));
    curTime.textContent = formatTime(currentTime);

    if (duration && isFinite(duration) && duration > 0) {
      totalTime.textContent = formatTime(duration);
      seek.setAttribute('aria-valuetext', formatTime(currentTime) + ' / ' + formatTime(duration));
    }
  }

  function updateRowDuration(index, label) {
    var row = trackList.querySelector('.track-row[data-index="' + index + '"]');
    if (!row) return;
    var node = row.querySelector('.track-duration');
    if (node) node.textContent = label;
  }

  function requestPlay() {
    if (!tracks.length) return;
    var promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setPlaying(false);
        nowArtist.textContent = '点击播放开始';
      });
    }
  }

  function load(index, autoplay) {
    if (!tracks.length) return;
    var next = ((index % tracks.length) + tracks.length) % tracks.length;
    var changed = next !== current;

    current = next;
    if (changed || !audio.getAttribute('src')) {
      audio.src = tracks[current].src;
      audio.load();
      progressFill.style.width = '0%';
      progressKnob.style.left = '0%';
      curTime.textContent = '00:00';
      if (!tracks[current].duration) {
        updateRowDuration(current, '--:--');
      }
    }

    updateNow();
    updateProgress();

    if (autoplay) requestPlay();
  }

  function step(delta) {
    if (!tracks.length) return;
    load((current < 0 ? 0 : current + delta), true);
  }

  function seekTo(clientX) {
    var duration = audio.duration;
    if (!duration || !isFinite(duration) || duration <= 0) return;
    var rect = seek.getBoundingClientRect();
    if (!rect.width) return;
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    updateProgress();
  }

  function renderEmpty() {
    trackList.hidden = true;
    trackEmpty.hidden = false;
    trackCount.textContent = '00 首';
    trackCountRole.textContent = '00 首';
    nowIndex.textContent = '00 / 00';
    nowTitle.textContent = '还没有曲目';
    nowArtist.textContent = '等第一首曲子';
    curTime.textContent = '00:00';
    totalTime.textContent = '00:00';
    progressFill.style.width = '0%';
    progressKnob.style.left = '0%';
    seek.setAttribute('aria-valuenow', '0');
    setControlsEnabled(false);
    setPlaying(false);
  }

  function render() {
    if (!tracks.length) {
      renderEmpty();
      return;
    }

    trackList.innerHTML = '';
    tracks.forEach(function (track, index) {
      var item = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'track-row';
      button.setAttribute('data-index', String(index));
      button.setAttribute('aria-label', '播放 ' + track.title);

      var number = document.createElement('span');
      number.className = 'track-no';
      number.textContent = pad(index + 1);

      var info = document.createElement('span');
      info.className = 'track-info';

      var title = document.createElement('span');
      title.className = 'track-title';
      title.textContent = track.title;

      var artist = document.createElement('span');
      artist.className = 'track-artist';
      artist.textContent = track.artist;

      var duration = document.createElement('span');
      duration.className = 'track-duration';
      duration.textContent = track.duration || '--:--';

      info.appendChild(title);
      info.appendChild(artist);
      button.appendChild(number);
      button.appendChild(info);
      button.appendChild(duration);
      item.appendChild(button);
      trackList.appendChild(item);

      button.addEventListener('click', function () {
        if (current === index) {
          if (audio.paused) {
            requestPlay();
          } else {
            audio.pause();
          }
        } else {
          load(index, true);
        }
      });
    });

    trackList.hidden = false;
    trackEmpty.hidden = true;
    trackCount.textContent = countLabel(tracks.length);
    trackCountRole.textContent = countLabel(tracks.length);
    setControlsEnabled(true);
    load(0, false);
  }

  playBtn.addEventListener('click', function () {
    if (!tracks.length) return;
    if (audio.paused) {
      if (current < 0) {
        load(0, true);
      } else {
        requestPlay();
      }
    } else {
      audio.pause();
    }
  });

  prevBtn.addEventListener('click', function () {
    if (!tracks.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      updateProgress();
    } else {
      step(-1);
    }
  });

  nextBtn.addEventListener('click', function () {
    step(1);
  });

  audio.addEventListener('play', function () {
    setPlaying(true);
  });

  audio.addEventListener('pause', function () {
    setPlaying(false);
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('durationchange', updateProgress);

  audio.addEventListener('loadedmetadata', function () {
    if (current < 0) return;
    if (audio.duration && isFinite(audio.duration)) {
      totalTime.textContent = formatTime(audio.duration);
      updateRowDuration(current, formatTime(audio.duration));
    }
  });

  audio.addEventListener('ended', function () {
    if (tracks.length > 1) {
      step(1);
    } else {
      audio.currentTime = 0;
      setPlaying(false);
      updateProgress();
    }
  });

  audio.addEventListener('error', function () {
    if (!tracks.length || current < 0) return;
    setPlaying(false);
    nowArtist.textContent = '音频文件未找到，检查一下路径';
  });

  volume.addEventListener('input', function () {
    audio.volume = Number(volume.value);
  });

  seek.addEventListener('pointerdown', function (event) {
    if (seek.getAttribute('aria-disabled') === 'true') return;
    seeking = true;
    seek.setPointerCapture(event.pointerId);
    seekTo(event.clientX);
  });

  seek.addEventListener('pointermove', function (event) {
    if (seeking) seekTo(event.clientX);
  });

  seek.addEventListener('pointerup', function (event) {
    seeking = false;
    try { seek.releasePointerCapture(event.pointerId); } catch (error) { /* noop */ }
  });

  seek.addEventListener('pointercancel', function () {
    seeking = false;
  });

  seek.addEventListener('keydown', function (event) {
    if (seek.getAttribute('aria-disabled') === 'true') return;
    var duration = audio.duration;
    if (!duration || !isFinite(duration)) return;
    var jump = event.shiftKey ? 10 : 5;
    if (event.key === 'ArrowRight') {
      audio.currentTime = Math.min(duration, audio.currentTime + jump);
    } else if (event.key === 'ArrowLeft') {
      audio.currentTime = Math.max(0, audio.currentTime - jump);
    } else if (event.key === 'Home') {
      audio.currentTime = 0;
    } else if (event.key === 'End') {
      audio.currentTime = duration;
    } else {
      return;
    }
    event.preventDefault();
    updateProgress();
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', requestPlay);
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { step(-1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { step(1); });
    } catch (error) {
      /* 部分浏览器不支持这些动作 */
    }
  }

  audio.volume = Number(volume.value);
  render();
})();
