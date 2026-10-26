(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const DIMS = window.DIMS || {};
  const WA = '5511926594857';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- abertura ---------- */
  const params = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem('ho-intro') === '1'; } catch (e) {}
  const finishIntro = () => {
    if (html.classList.contains('intro-done')) return;
    html.classList.add('intro-done');
    setTimeout(() => html.classList.add('ready'), 150);
    try { sessionStorage.setItem('ho-intro', '1'); } catch (e) {}
  };
  if ((seen || reduce) && !params.has('intro')) {
    html.classList.add('no-intro', 'intro-done');
    requestAnimationFrame(() => html.classList.add('ready'));
  } else {
    const count = $('[data-intro-count]');
    let n = 0;
    const t = setInterval(() => { n = Math.min(36, n + 1); count.textContent = String(n).padStart(2, '0'); if (n === 36) clearInterval(t); }, 70);
    setTimeout(finishIntro, 3000);
    addEventListener('click', finishIntro, { once: true });
    addEventListener('keydown', finishIntro, { once: true });
  }

  /* ---------- fábrica de imagens ---------- */
  const src = (id, size) => (size === 'm' ? 'img/m/' : 'img/') + id + '.jpg';
  const img = (id, size, alt = '') => {
    const d = DIMS[id] || [1200, 1600];
    const el = document.createElement('img');
    el.src = src(id, size);
    el.width = d[0]; el.height = d[1];
    el.loading = 'lazy'; el.decoding = 'async'; el.alt = alt;
    el.dataset.full = src(id);
    el.className = 'dev';
    return el;
  };
  const list = el => el.split(',').map(s => s.trim()).filter(Boolean);

  // tira de filme (palco)
  $$('[data-frames]').forEach(box => {
    const cap = box.closest('.roll')?.querySelector('.roll__cap')?.textContent || '';
    list(box.dataset.frames).forEach((id, i) => {
      const f = document.createElement('figure');
      f.className = 'frame';
      f.appendChild(img(id, 'm', cap));
      f.insertAdjacentHTML('beforeend', `<span class="frame__n">${String(i + 1).padStart(2, '0')}A</span>`);
      box.appendChild(f);
    });
  });

  // folha de contato com círculo vermelho
  const ring = 'M50 6 C78 4 97 24 95 52 C93 80 70 97 46 95 C20 93 3 72 6 46 C9 22 30 5 58 9';
  $$('[data-sheet]').forEach(box => {
    const pick = +box.dataset.pick;
    const cross = box.dataset.x ? +box.dataset.x : -1;
    const cap = box.closest('.sheet')?.querySelector('h3')?.textContent || '';
    list(box.dataset.sheet).forEach((id, i) => {
      const c = document.createElement('figure');
      c.className = 'cell' + (i === cross ? ' x' : '');
      c.appendChild(img(id, 'm', cap));
      c.insertAdjacentHTML('beforeend', `<span class="cell__n">${String(i * 2 + 1).padStart(2, '0')} ▸</span>`);
      if (i === pick) c.insertAdjacentHTML('beforeend', `<svg class="mark" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${ring}" vector-effect="non-scaling-stroke"/></svg>`);
      box.appendChild(c);
    });
  });
  $$('.mark path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength() * 6)));

  /* ---------- revelação ao entrar na tela ---------- */
  const devIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const go = () => el.classList.add('is-dev');
    el.complete ? setTimeout(go, 60) : el.addEventListener('load', go, { once: true });
    devIO.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('img.dev').forEach(el => devIO.observe(el));

  const inIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); inIO.unobserve(e.target); } }), { threshold: .35 });
  $$('.sheet__grid').forEach(el => inIO.observe(el));

  /* ---------- hero: rajada ---------- */
  const cols = $$('[data-burst], [data-burst-sites]').map(col => {
    const sites = !!col.dataset.burstSites;
    const imgs = list(col.dataset.burst || col.dataset.burstSites).map((id, i) => {
      const el = document.createElement('img');
      el.src = sites ? `img/sites/${id}-m.jpg` : src(id, 'm'); el.alt = ''; el.decoding = 'async';
      if (sites) el.className = 'is-site';
      if (i > 1) el.loading = 'lazy';
      if (i === 0) el.classList.add('is-on');
      col.appendChild(el); return el;
    });
    return { col, imgs, i: 0 };
  });
  let turn = 0;
  if (cols.length && !reduce) setInterval(() => {
    if (document.hidden || scrollY > innerHeight) return;
    const c = cols[turn++ % cols.length];
    if (!c.col.offsetParent) return;
    c.imgs[c.i].classList.remove('is-on');
    c.i = (c.i + 1) % c.imgs.length;
    c.imgs[c.i].classList.add('is-on');
    c.col.classList.remove('flash'); void c.col.offsetWidth; c.col.classList.add('flash');
  }, 1100);

  /* ---------- vitrine de sites ---------- */
  const vit = $('[data-vitrine]');
  if (vit) {
    const desk = $('[data-desk]', vit), phone = $('[data-phone]', vit), openA = $('[data-open]', vit);
    const btns = $$('[data-site]', vit);
    btns.forEach(b => { const pre = new Image(); pre.src = `img/sites/${b.dataset.site}-d.jpg`; });
    const pickSite = b => {
      if (b.getAttribute('aria-pressed') === 'true') return;
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      const id = b.dataset.site, name = $('b', b).textContent;
      vit.classList.add('is-swap');
      setTimeout(() => {
        desk.src = `img/sites/${id}-d.jpg`; desk.alt = `Site de ${name} no computador`;
        phone.src = `img/sites/${id}-m.jpg`; phone.alt = `Site de ${name} no celular`;
        openA.href = b.dataset.url;
        vit.classList.remove('is-swap');
      }, 180);
    };
    btns.forEach(b => {
      b.addEventListener('click', () => pickSite(b));
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pickSite(b); });
    });
  }

  /* ---------- vídeos sob demanda ---------- */
  const vIO = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  }), { rootMargin: '200px' });
  $$('[data-lazyplay], .hero video').forEach(v => vIO.observe(v));
  $$('.frame--video').forEach(f => f.addEventListener('click', () => {
    const v = f.querySelector('video'); v.muted = !v.muted; v.play().catch(() => {});
    f.dataset.cursor = v.muted ? 'som' : 'mudo';
  }));

  /* ---------- nav ---------- */
  const nav = $('[data-nav]');
  const zones = $$('[data-hd]');
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  const setMenu = open => { burger.setAttribute('aria-expanded', open); menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- rolagem (um só rAF) ---------- */
  const palco = $('[data-pin]'), track = $('[data-track]'), bar = $('[data-bar]');
  const sizePalco = () => {
    const extra = Math.max(0, track.scrollWidth - innerWidth);
    palco.style.height = (innerHeight + extra) + 'px';
    palco._extra = extra;
  };
  sizePalco();
  addEventListener('resize', sizePalco);
  addEventListener('load', sizePalco);

  let lastY = scrollY, ticking = false;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;

    // nav esconde descendo e troca de cor por zona
    if (menu.hidden) nav.classList.toggle('is-hidden', y > lastY && y > 200);
    let tone = 'dark';
    for (const z of zones) { const r = z.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) { tone = z.dataset.hd; break; } }
    nav.classList.toggle('is-light', tone === 'light' && menu.hidden);
    lastY = y;

    // palco: rolagem vira trilho horizontal
    const pr = palco.getBoundingClientRect();
    const pp = clamp(-pr.top / (palco._extra || 1));
    track.style.transform = `translate3d(${-pp * palco._extra}px,0,0)`;
    bar.style.width = (pp * 100) + '%';

  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- cursor de foco ---------- */
  const focus = $('.focus');
  if (matchMedia('(hover:hover)').matches) {
    addEventListener('pointermove', e => {
      focus.style.left = e.clientX + 'px'; focus.style.top = e.clientY + 'px';
      focus.classList.toggle('is-on', !!e.target.closest('.frame, .cell'));
    }, { passive: true });
  }

  /* ---------- lightbox ---------- */
  const lb = $('[data-lb]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]');
  let group = [], gi = 0;
  const show = i => {
    gi = (i + group.length) % group.length;
    const im = group[gi];
    lbImg.src = im.dataset.full; lbImg.alt = im.alt;
    lbCap.textContent = `${im.alt ? im.alt + ' · ' : ''}${gi + 1}/${group.length}`;
  };
  const open = im => {
    const box = im.closest('[data-frames],[data-sheet]');
    group = $$('img', box);
    lb.hidden = false; document.body.style.overflow = 'hidden';
    show(Math.max(0, group.indexOf(im)));
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  document.addEventListener('click', e => {
    const cell = e.target.closest('.frame:not(.frame--video), .cell');
    if (!cell) return;
    open($('img', cell));
  });
  $('[data-lb-close]').addEventListener('click', close);
  $('[data-lb-prev]').addEventListener('click', () => show(gi - 1));
  $('[data-lb-next]').addEventListener('click', () => show(gi + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(gi - 1);
    if (e.key === 'ArrowRight') show(gi + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(gi + (dx < 0 ? 1 : -1)); sx = null; });

  /* ---------- briefing → WhatsApp ---------- */
  const form = $('[data-brief]'), preview = $('[data-preview]');
  const tipos = new Set();
  const compose = () => {
    const f = new FormData(form);
    const nome = (f.get('nome') || '').trim(), marca = (f.get('marca') || '').trim(), seg = (f.get('quando') || '').trim(), msg = (f.get('msg') || '').trim();
    const lines = ['Fala, Hector! Faça sua marca se conectar com pessoas. 🖤'];
    if (nome) lines.push(`Sou ${nome}${marca ? ', de ' + marca : ''}.`);
    else if (marca) lines.push(`Aqui é ${marca}.`);
    if (tipos.size) lines.push(`Quero: ${[...tipos].join(', ')}.`);
    if (seg) lines.push(`Segmento: ${seg}.`);
    if (msg) lines.push(`O desafio: ${msg}`);
    return lines.join('\n');
  };
  const refresh = () => { preview.textContent = compose(); };
  $$('[data-group="tipo"] button').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', on);
    on ? tipos.add(b.dataset.v) : tipos.delete(b.dataset.v);
    refresh();
  }));
  form.addEventListener('input', refresh);
  form.addEventListener('submit', e => {
    e.preventDefault();
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(compose())}`, '_blank', 'noopener');
  });
  refresh();
})();
