/* SKY YOO — site behaviours
   - Smooth scrolling (Lenis, loaded from CDN; falls back to native)
   - Header hides on scroll down, shows on scroll up
   - Reveal-on-scroll
   - Draggable stickers on Home
   - Case study side nav highlights the current section
*/
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -72 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (el) { e.preventDefault(); scrollToEl(el); history.replaceState(null, '', '#' + id); }
  });

  // ---- Header
  const header = document.querySelector('.site-header');
  if (header) {
    let last = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('is-hidden', y > last && y > 160 && !header.classList.contains('menu-open'));
      last = y;
    }, { passive: true });
    const btn = header.querySelector('.menu-btn');
    if (btn) btn.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  // ---- Reveal
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  document.querySelectorAll('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('is-in'));

  // ---- Page loaded (hero title animation)
  requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));

  // ---- Text roll on hover (header + footer links), like the live Framer nav
  document.querySelectorAll('.nav a, .logo span, .header-cta, .footer-links .col:first-child a').forEach((el) => {
    if (el.querySelector('.roll')) return;
    const label = el.textContent.trim();
    if (!label) return;
    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.innerHTML = `<span>${label}</span><span aria-hidden="true">${label}</span>`;
    el.textContent = '';
    el.appendChild(roll);
  });

  // ---- Header background once scrolled
  if (header) {
    const onS = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onS(); window.addEventListener('scroll', onS, { passive: true });
  }

  // ---- Typing title (About): <h1 class="type-on">
  // window.typeOn(el, text) is also called by i18n.js when the language changes.
  window.typeOn = (el, text) => {
    clearTimeout(el._typeTimer);
    el.setAttribute('aria-label', text); el.textContent = '';
    [...text].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; el.appendChild(s); });
    const chars = [...el.querySelectorAll('.ch')];
    if (reduce) { chars.forEach((c) => (c.style.opacity = 1)); return; }
    let i = 0; const tick = () => { if (i < chars.length) { chars[i++].style.opacity = 1; el._typeTimer = setTimeout(tick, 55); } };
    el._typeTimer = setTimeout(tick, 300);
  };
  document.querySelectorAll('.type-on').forEach((el) => {
    el.dataset.en = el.textContent.trim();
    window.typeOn(el, el.dataset.en);
  });

  // ---- Falling stickers (Home): .physics with .body children, needs Matter.js
  const stage = document.querySelector('.physics');
  if (stage) {
    const bodies = [...stage.querySelectorAll('.body')];
    const start = () => {
      if (!window.Matter || reduce) {
        // Static fallback: lay the pieces out in a loose stack.
        let y = stage.clientHeight; bodies.slice().reverse().forEach((el, k) => {
          y -= el.offsetHeight + 4;
          const x = (stage.clientWidth - el.offsetWidth) / 2 + (k % 2 ? 60 : -60);
          el.style.transform = `translate(${x}px,${y}px) rotate(${k % 2 ? 4 : -3}deg)`;
        });
        return;
      }
      const { Engine, Bodies, Composite, Mouse, MouseConstraint, Runner, Body } = window.Matter;
      const engine = Engine.create({ gravity: { y: 1.1 } });
      const W = stage.clientWidth, H = stage.clientHeight, T = 200;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),
        Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
        Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
      ]);
      const pairs = bodies.map((el, k) => {
        const w = el.offsetWidth, h = el.offsetHeight;
        const x = W * (0.3 + 0.4 * ((k * 37) % 10) / 10);
        const y = -120 - k * 140;
        const b = el.classList.contains('p-dot')
          ? Bodies.circle(x, y, w / 2, { restitution: 0.35, friction: 0.3 })
          : Bodies.rectangle(x, y, w, h, { chamfer: { radius: h / 2 - 1 }, restitution: 0.25, friction: 0.4 });
        Body.setAngle(b, (k % 2 ? 1 : -1) * 0.25);
        Composite.add(engine.world, b);
        return { el, b, w, h };
      });
      const mouse = Mouse.create(stage);
      mouse.element.removeEventListener('wheel', mouse.mousewheel);
      mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
      mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
      Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));
      const runner = Runner.create(); Runner.run(runner, engine);
      const draw = () => {
        pairs.forEach(({ el, b, w, h }) => {
          el.style.transform = `translate(${b.position.x - w / 2}px,${b.position.y - h / 2}px) rotate(${b.angle}rad)`;
        });
        requestAnimationFrame(draw);
      };
      draw();
    };
    // Start when the hero is on screen (and fonts are ready so sizes are right).
    const go = () => (document.fonts && document.fonts.ready ? document.fonts.ready.then(start) : start());
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { o.disconnect(); go(); } }, { threshold: 0.2 });
      o.observe(stage);
    } else go();
  }

  // ---- Draggable stickers (legacy)
  document.querySelectorAll('.sticker').forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, rot = parseFloat(el.dataset.rot || 0);
    el.style.transform = `translate(0px,0px) rotate(${rot}deg)`;
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      sx = e.clientX - ox; sy = e.clientY - oy;
      el.style.zIndex = String(Date.now() % 100000);
      el.style.transition = 'box-shadow .2s';
    });
    el.addEventListener('pointermove', (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      ox = e.clientX - sx; oy = e.clientY - sy;
      el.style.transform = `translate(${ox}px,${oy}px) rotate(${rot + ox * 0.03}deg)`;
    });
    el.addEventListener('pointerup', () => {
      el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1), box-shadow .2s';
      el.style.transform = `translate(${ox}px,${oy}px) rotate(${rot}deg)`;
    });
  });

  // ---- Case side nav
  const side = document.querySelector('.cs-side');
  if (side && io) {
    const links = [...side.querySelectorAll('a')];
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          const a = map.get(en.target.id); if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // ---- Year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---- Image zoom (case studies + work): click an image to view it large.
  // A 2x version is loaded from assets/img/hd/<same path> when it exists; otherwise the original is used.

  // ---- Videos: <img data-video="..."> becomes a muted, looping video that plays while on screen.
  // The image stays as the poster, and the video file only downloads when it scrolls near the viewport.
  const vids = [];
  document.querySelectorAll('img[data-video]').forEach((img) => {
    const v = document.createElement('video');
    v.className = `${img.className} cs-video`.trim();
    v.poster = img.getAttribute('src');
    v.dataset.src = img.dataset.video;
    v.dataset.poster = img.getAttribute('src');
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'none';
    v.setAttribute('aria-label', img.alt);
    v.dataset.alt = img.alt;
    if (img.getAttribute('width')) v.setAttribute('width', img.getAttribute('width'));
    if (img.getAttribute('style')) v.setAttribute('style', img.getAttribute('style'));
    const ratio = () => { if (img.naturalWidth) v.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; };
    if (img.complete) ratio(); else img.addEventListener('load', ratio, { once: true });
    img.replaceWith(v);
    vids.push(v);
  });
  if (vids.length) {
    const io = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        if (!reduce) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }), { rootMargin: '200px 0px' });
    vids.forEach((v) => io.observe(v));
  }

  const zoomables = [...document.querySelectorAll('.cs img, .cs video.cs-video, .work-row__media img')]
    .filter((img) => !img.closest('a, .persona, .cs-hero, .cs-hero__top, .avatar, .other-card, .project-card'));
  if (zoomables.length) {
    const box = document.createElement('div');
    box.className = 'zoom';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = `
      <div class="zoom__stage"><img class="zoom__img" alt=""><video class="zoom__video" muted loop playsinline controls></video></div>
      <p class="zoom__cap"></p>
      <button class="zoom__btn zoom__close" type="button" aria-label="Close">×</button>
      <button class="zoom__btn zoom__prev" type="button" aria-label="Previous image">‹</button>
      <button class="zoom__btn zoom__next" type="button" aria-label="Next image">›</button>
      <span class="zoom__count"></span>`;
    document.body.appendChild(box);
    const stage = box.querySelector('.zoom__stage');
    const big = box.querySelector('.zoom__img');
    const cap = box.querySelector('.zoom__cap');
    const count = box.querySelector('.zoom__count');
    let idx = 0; let lastFocus = null;

    const hdSrc = (src) => src.replace(/\/assets\/img\/(korail|heartpath|forest|hd-samho|kier|cesium)\/(?:screens\/)?/, '/assets/img/hd/$1/');
    const captionOf = (img) => {
      const fig = img.closest('figure');
      const fc = fig && fig.querySelector('figcaption');
      return (fc && fc.textContent.trim()) || img.alt || img.dataset.alt || '';
    };
    const bigVideo = box.querySelector('.zoom__video');
    const show = (i) => {
      idx = (i + zoomables.length) % zoomables.length;
      const img = zoomables[idx];
      box.classList.remove('is-actual');
      stage.scrollTo(0, 0);
      if (img.tagName === 'VIDEO') {                 // video: play it large with controls
        box.classList.add('is-video');
        big.removeAttribute('src');
        bigVideo.poster = img.dataset.poster;
        bigVideo.src = img.dataset.src;
        bigVideo.muted = true;
        bigVideo.play().catch(() => {});
        cap.textContent = captionOf(img);
        count.textContent = zoomables.length > 1 ? `${idx + 1} / ${zoomables.length}` : '';
        return;
      }
      box.classList.remove('is-video');
      bigVideo.pause(); bigVideo.removeAttribute('src'); bigVideo.load();
      big.src = img.currentSrc || img.src;          // show the page image instantly
      big.alt = img.alt;
      cap.textContent = captionOf(img);
      count.textContent = zoomables.length > 1 ? `${idx + 1} / ${zoomables.length}` : '';
      const hd = hdSrc(img.src);
      if (hd !== img.src) {
        const pre = new Image();
        pre.onload = () => { if (zoomables[idx] === img) big.src = hd; };
        pre.src = hd;
      }
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.documentElement.classList.add('zoom-lock');
      if (lenis) lenis.stop();
      box.querySelector('.zoom__close').focus();
    };
    const close = () => {
      box.classList.remove('is-open', 'is-actual');
      bigVideo.pause();
      document.documentElement.classList.remove('zoom-lock');
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus();
    };

    zoomables.forEach((img, i) => {
      img.classList.add('zoomable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Enlarge image: ${img.alt || captionOf(img)}`);
      img.addEventListener('click', () => open(i));
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    // Click the large image to toggle fit-to-screen / actual size (scrollable)
    big.addEventListener('click', (e) => {
      e.stopPropagation();
      const fits = big.naturalWidth <= stage.clientWidth && big.naturalHeight <= stage.clientHeight;
      if (!fits || box.classList.contains('is-actual')) box.classList.toggle('is-actual');
    });
    stage.addEventListener('click', (e) => { if (e.target === stage) close(); });
    box.querySelector('.zoom__close').addEventListener('click', close);
    box.querySelector('.zoom__prev').addEventListener('click', () => show(idx - 1));
    box.querySelector('.zoom__next').addEventListener('click', () => show(idx + 1));
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
    if (zoomables.length < 2) box.classList.add('is-single');
  }
})();
