(function () {
  'use strict';

  function initHero(root) {
    var video = root.querySelector('[data-amesh-hero-video]');
    var canvas = root.querySelector('[data-amesh-hero-canvas]');
    if (!video || !canvas) return;

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var heading = (canvas.getAttribute('data-heading') || '').toUpperCase();
    var rafId = null;
    var isVisible = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function fontSizePx() {
      var vw = window.innerWidth;
      return Math.max(vw * 0.07, 32);
    }

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function drawCoveredVideo(cw, ch) {
      var vw = video.videoWidth;
      var vh = video.videoHeight;
      if (!vw || !vh) return;

      var scale = Math.max(cw / vw, ch / vh);
      var drawWidth = vw * scale;
      var drawHeight = vh * scale;
      var offsetX = (cw - drawWidth) / 2;
      var offsetY = (ch - drawHeight) / 2;

      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    }

    function frame() {
      rafId = window.requestAnimationFrame(frame);
      if (!isVisible || video.readyState < 2) return;

      var cw = canvas.width;
      var ch = canvas.height;
      var size = fontSizePx() * dpr;

      ctx.clearRect(0, 0, cw, ch);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "600 " + size + "px 'Oswald', sans-serif";

      ctx.fillStyle = '#000000';
      ctx.fillText(heading, cw / 2, ch / 2);

      ctx.globalCompositeOperation = 'source-in';
      drawCoveredVideo(cw, ch);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "600 " + size + "px 'Oswald', sans-serif";
      ctx.lineWidth = Math.max(1, size * 0.01);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.strokeText(heading, cw / 2, ch / 2);
      ctx.restore();
    }

    function start() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    window.addEventListener('resize', resize);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      observer.observe(root);
    }

    video.addEventListener('play', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
  }

  function init() {
    document.querySelectorAll('[data-amesh-hero]').forEach(initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
