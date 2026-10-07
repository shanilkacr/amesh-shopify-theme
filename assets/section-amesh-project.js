(function () {
  function initVideo(video) {
    var start = parseFloat(video.getAttribute('data-start')) || 0;
    var end = parseFloat(video.getAttribute('data-end')) || 0;
    if (!start && !end) return;
    video.addEventListener('loadedmetadata', function () {
      if (start) video.currentTime = start;
    });
    video.addEventListener('timeupdate', function () {
      if (end && video.currentTime >= end) video.currentTime = start;
    });
  }

  function justify(gallery) {
    var items = Array.prototype.slice.call(gallery.children);
    var width = gallery.clientWidth;
    var small = window.innerWidth <= 1024;
    var ideal = small ? 150 : parseFloat(gallery.getAttribute('data-ideal')) || 500;
    var gap = small ? 10 : parseFloat(gallery.getAttribute('data-gap')) || 0;
    var ratios = items.map(function (a) {
      var img = a.querySelector('img');
      return img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    });
    var rows = [];
    var row = [];
    var sum = 0;
    function heightFor(count, ratioSum) {
      return (width - gap * (count - 1)) / ratioSum;
    }
    ratios.forEach(function (r, i) {
      if (row.length) {
        var without = heightFor(row.length, sum);
        var withIt = heightFor(row.length + 1, sum + r);
        if (Math.abs(withIt - ideal) > Math.abs(without - ideal)) {
          rows.push({ idx: row, sum: sum });
          row = [];
          sum = 0;
        }
      }
      row.push(i);
      sum += r;
    });
    if (row.length) rows.push({ idx: row, sum: sum });

    rows.forEach(function (rw, rowIndex) {
      var h = heightFor(rw.idx.length, rw.sum);
      var used = 0;
      rw.idx.forEach(function (i, n) {
        var el = items[i];
        var w = n === rw.idx.length - 1 ? width - used - gap * n : Math.floor(ratios[i] * h);
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.aspectRatio = 'auto';
        el.style.marginRight = n === rw.idx.length - 1 ? '0' : gap + 'px';
        el.style.marginBottom = rowIndex === rows.length - 1 ? '0' : gap + 'px';
        used += w;
      });
    });
    gallery.classList.add('is-laid-out');
  }

  function initGallery(gallery) {
    var imgs = Array.prototype.slice.call(gallery.querySelectorAll('img'));
    var pending = imgs.length;
    function layout() { justify(gallery); }
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth) { pending--; return; }
      var done = function () { pending--; if (pending <= 0) layout(); };
      img.addEventListener('load', done);
      img.addEventListener('error', done);
    });
    if (pending <= 0) layout();
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(layout, 120);
    });
    initLightbox(gallery);
  }

  function initLightbox(gallery) {
    var links = Array.prototype.slice.call(gallery.children);
    var box = document.createElement('div');
    box.className = 'amesh-lightbox';
    box.innerHTML =
      '<div class="amesh-lightbox__count"></div>' +
      '<button type="button" class="amesh-lightbox__btn amesh-lightbox__close" aria-label="Close">&times;</button>' +
      '<button type="button" class="amesh-lightbox__btn amesh-lightbox__prev" aria-label="Previous">&#8249;</button>' +
      '<img class="amesh-lightbox__img" alt="">' +
      '<button type="button" class="amesh-lightbox__btn amesh-lightbox__next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(box);
    var img = box.querySelector('.amesh-lightbox__img');
    var count = box.querySelector('.amesh-lightbox__count');
    var current = 0;
    function show(i) {
      current = (i + links.length) % links.length;
      img.src = links[current].getAttribute('href');
      count.textContent = current + 1 + ' / ' + links.length;
    }
    function close() { box.classList.remove('is-open'); }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        box.classList.add('is-open');
      });
    });
    box.querySelector('.amesh-lightbox__close').addEventListener('click', close);
    box.querySelector('.amesh-lightbox__prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    box.querySelector('.amesh-lightbox__next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  document.querySelectorAll('[data-amesh-project]').forEach(function (root) {
    var v = root.querySelector('video');
    if (v) initVideo(v);
    var g = root.querySelector('[data-gallery]');
    if (g) initGallery(g);
  });
})();
