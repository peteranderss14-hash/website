(() => {
  'use strict';

  const STORAGE_KEY = 'madison_profile_clean_v1';
  const $ = id => document.getElementById(id);

  const defaults = {
    name: 'madison',
    handle: '@madisonbeer',
    bio: '𓂃˖ ࣪⊹ they say that honest love is a cage that makes you feel free.',
    nameFont: 'palatino',
    nameColor: '#f7fbff',
    shimmer: true,
    outline: false,
    rgb: false,
    background: '#aac6d1',
    cardDarkness: 0.36,
    cardBlur: 18,
    particles: true,
    cursorGlow: true,
    dotCursor: true,
    tilt: true,
    parallax: true,
    avatar: 'avatar.png',
    album: 'album.png',
    song: 'song.mp3',
    video: ''
  };

  const fontMap = {
    palatino: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
    georgia: 'Georgia, "Times New Roman", serif',
    segoe: '"Segoe UI", Arial, sans-serif',
    trebuchet: '"Trebuchet MS", "Segoe UI", sans-serif'
  };

  const els = {
    body: document.body,
    card: $('profileCard'),
    name: $('displayName'),
    handle: $('handle'),
    bio: $('bio'),
    avatar: $('avatar'),
    album: $('albumArt'),
    audio: $('audio'),
    play: $('playButton'),
    playGlyph: $('playGlyph'),
    progress: $('progress'),
    current: $('currentTime'),
    duration: $('duration'),
    video: $('backgroundVideo'),
    glow: $('cursorGlow'),
    dot: $('cursorDot'),
    canvas: $('particles'),
    panel: $('panel'),
    closePanel: $('closePanel'),
    toast: $('toast')
  };

  const controls = {
    name: $('setName'), handle: $('setHandle'), bio: $('setBio'),
    nameFont: $('setNameFont'), nameColor: $('setNameColor'), shimmer: $('setShimmer'), outline: $('setOutline'), rgb: $('setRgb'),
    background: $('setBackground'), cardDarkness: $('setCardDarkness'), cardBlur: $('setCardBlur'),
    particles: $('setParticles'), cursorGlow: $('setCursorGlow'), dotCursor: $('setDotCursor'), tilt: $('setTilt'), parallax: $('setParallax'),
    avatar: $('setAvatar'), album: $('setAlbum'), song: $('setSong'), video: $('setVideo')
  };

  let state = loadState();
  let secretArmed = false;
  let secretBuffer = '';
  let clickTimes = [];
  let toastTimer = 0;
  let particleData = [];
  let raf = 0;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function safeLocalFilename(value, fallback) {
    const v = String(value || '').trim();
    if (!v) return fallback;
    if (/^(https?:|data:|javascript:|\/\/)/i.test(v)) return fallback;
    if (v.includes('..')) return fallback;
    return v;
  }

  function setMediaSrc(img, filename, fallback) {
    const src = safeLocalFilename(filename, fallback);
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  }

  function applyState() {
    const root = document.documentElement.style;
    root.setProperty('--bg', state.background);
    root.setProperty('--card-darkness', String(state.cardDarkness));
    root.setProperty('--card-blur', `${state.cardBlur}px`);
    root.setProperty('--name-color', state.nameColor);
    root.setProperty('--name-font', fontMap[state.nameFont] || fontMap.palatino);

    els.name.textContent = state.name;
    els.name.dataset.text = state.name;
    els.handle.textContent = state.handle;
    els.bio.textContent = state.bio;
    document.title = state.name || 'madison';

    document.body.classList.toggle('name-shimmer', !!state.shimmer);
    document.body.classList.toggle('name-outline', !!state.outline);
    document.body.classList.toggle('name-rgb', !!state.rgb);
    document.body.classList.toggle('glow-on', !!state.cursorGlow);
    document.body.classList.toggle('dot-on', !!state.dotCursor);

    setMediaSrc(els.avatar, state.avatar, 'avatar.png');
    setMediaSrc(els.album, state.album, 'album.png');

    const song = safeLocalFilename(state.song, 'song.mp3');
    if (els.audio.getAttribute('src') !== song) {
      const wasPlaying = !els.audio.paused;
      els.audio.pause();
      els.audio.setAttribute('src', song);
      els.audio.load();
      if (wasPlaying) els.audio.play().catch(() => {});
    }

    const video = safeLocalFilename(state.video, '');
    if (video) {
      if (els.video.getAttribute('src') !== video) {
        els.video.setAttribute('src', video);
        els.video.load();
      }
      els.video.classList.add('active');
      els.video.play().catch(() => {});
    } else {
      els.video.pause();
      els.video.removeAttribute('src');
      els.video.load();
      els.video.classList.remove('active');
    }

    syncControls();
    initParticles();
  }

  function syncControls() {
    Object.entries(controls).forEach(([key, control]) => {
      if (!control || !(key in state)) return;
      if (control.type === 'checkbox') control.checked = !!state[key];
      else control.value = state[key];
    });
  }

  function pullControls() {
    Object.entries(controls).forEach(([key, control]) => {
      if (!control) return;
      if (control.type === 'checkbox') state[key] = control.checked;
      else if (control.type === 'range') state[key] = Number(control.value);
      else state[key] = control.value;
    });
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;
  }

  function toggleAudio() {
    if (!els.audio.paused) {
      els.audio.pause();
      return;
    }
    els.audio.play().catch(() => showToast('Could not play song.mp3 — check that the file is in the repo root.'));
  }

  function updatePlayUi() {
    const playing = !els.audio.paused;
    document.body.classList.toggle('audio-playing', playing);
    els.playGlyph.textContent = playing ? '❚❚' : '▶';
    els.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function showToast(text) {
    clearTimeout(toastTimer);
    els.toast.textContent = text;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function openPanel() {
    secretArmed = false;
    secretBuffer = '';
    syncControls();
    els.panel.classList.add('open');
    els.panel.setAttribute('aria-hidden','false');
    showToast('secret panel unlocked');
  }

  function closePanel() {
    els.panel.classList.remove('open');
    els.panel.setAttribute('aria-hidden','true');
  }

  function nameClicked() {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(t => now - t < 1300);
    if (clickTimes.length >= 3) {
      clickTimes = [];
      secretArmed = true;
      secretBuffer = '';
      showToast('type AHMED');
      setTimeout(() => { secretArmed = false; secretBuffer = ''; }, 10000);
    }
  }

  function keyHandler(event) {
    if (!secretArmed) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
    secretBuffer = (secretBuffer + event.key.toLowerCase()).slice(-5);
    if (secretBuffer === 'ahmed') openPanel();
  }

  function applyPreset(name) {
    if (name === 'locket') Object.assign(state, { background:'#aac6d1', cardDarkness:.36, cardBlur:18, nameFont:'palatino', nameColor:'#f7fbff', shimmer:true, outline:false, rgb:false, particles:true, cursorGlow:true, dotCursor:true, tilt:true, parallax:true });
    if (name === 'minimal') Object.assign(state, { background:'#aac6d1', cardDarkness:.28, cardBlur:14, nameFont:'georgia', nameColor:'#ffffff', shimmer:false, outline:false, rgb:false, particles:false, cursorGlow:true, dotCursor:true, tilt:false, parallax:false });
    if (name === 'glass') Object.assign(state, { background:'#aac6d1', cardDarkness:.22, cardBlur:28, nameFont:'palatino', nameColor:'#ffffff', shimmer:true, outline:true, rgb:false, particles:true, cursorGlow:true, dotCursor:true, tilt:true, parallax:true });
    applyState();
  }

  function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    els.canvas.width = innerWidth * dpr;
    els.canvas.height = innerHeight * dpr;
    els.canvas.style.width = `${innerWidth}px`;
    els.canvas.style.height = `${innerHeight}px`;
    els.canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    initParticles();
  }

  function initParticles() {
    const count = state.particles ? 32 : 0;
    particleData = Array.from({length:count}, () => ({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: Math.random()*.9+.25,
      v: Math.random()*.12+.025,
      a: Math.random()*.25+.06
    }));
  }

  function animateParticles() {
    const ctx = els.canvas.getContext('2d');
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if (state.particles) {
      for (const p of particleData) {
        p.y -= p.v;
        if (p.y < -4) { p.y = innerHeight + 4; p.x = Math.random()*innerWidth; }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${p.a})`; ctx.fill();
      }
    }
    raf = requestAnimationFrame(animateParticles);
  }

  function pointerMove(event) {
    els.glow.style.left = `${event.clientX}px`;
    els.glow.style.top = `${event.clientY}px`;
    els.dot.style.left = `${event.clientX}px`;
    els.dot.style.top = `${event.clientY}px`;

    if (state.parallax) {
      const x = (event.clientX / innerWidth - .5) * 7;
      const y = (event.clientY / innerHeight - .5) * 7;
      document.querySelector('.background').style.transform = `translate3d(${x}px,${y}px,0) scale(1.02)`;
      if (els.video.classList.contains('active')) els.video.style.transform = `translate3d(${x}px,${y}px,0) scale(1.03)`;
    }

    if (state.tilt && innerWidth > 700) {
      const r = els.card.getBoundingClientRect();
      if (event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom) {
        const x = (event.clientX-r.left)/r.width-.5;
        const y = (event.clientY-r.top)/r.height-.5;
        els.card.style.transform = `perspective(1100px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg)`;
      } else {
        els.card.style.transform = '';
      }
    } else {
      els.card.style.transform = '';
    }
  }

  function bind() {
    els.name.addEventListener('click', nameClicked);
    document.addEventListener('keydown', keyHandler);
    els.closePanel.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.panel-section').forEach(s => s.classList.toggle('active', s.dataset.section === tab.dataset.tab));
    }));

    document.querySelectorAll('.preset').forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.preset)));

    Object.values(controls).forEach(control => {
      const eventName = control.type === 'checkbox' || control.type === 'color' || control.tagName === 'SELECT' ? 'change' : 'input';
      control.addEventListener(eventName, () => { pullControls(); applyState(); });
    });

    $('saveLocal').addEventListener('click', () => {
      pullControls(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); showToast('saved in this browser');
    });
    $('resetLocal').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY); state = { ...defaults }; applyState(); showToast('reset to defaults');
    });

    document.querySelector('[data-action="copy"]').addEventListener('click', async event => {
      const value = event.currentTarget.dataset.value;
      try { await navigator.clipboard.writeText(value); showToast('discord username copied'); }
      catch { showToast(value); }
    });

    els.play.addEventListener('click', toggleAudio);
    els.audio.addEventListener('play', updatePlayUi);
    els.audio.addEventListener('pause', updatePlayUi);
    els.audio.addEventListener('ended', updatePlayUi);
    els.audio.addEventListener('loadedmetadata', () => { els.duration.textContent = formatTime(els.audio.duration); });
    els.audio.addEventListener('timeupdate', () => {
      els.current.textContent = formatTime(els.audio.currentTime);
      els.progress.value = els.audio.duration ? String((els.audio.currentTime/els.audio.duration)*100) : '0';
    });
    els.audio.addEventListener('error', () => showToast('song.mp3 could not be loaded'));
    els.progress.addEventListener('input', () => {
      if (els.audio.duration) els.audio.currentTime = (Number(els.progress.value)/100)*els.audio.duration;
    });

    els.avatar.addEventListener('error', () => showToast('avatar.png could not be loaded'));
    els.album.addEventListener('error', () => showToast('album.png could not be loaded'));
    els.video.addEventListener('error', () => { els.video.classList.remove('active'); state.video=''; controls.video.value=''; showToast('background video ignored because it could not be loaded'); });

    window.addEventListener('mousemove', pointerMove, {passive:true});
    window.addEventListener('resize', resizeCanvas, {passive:true});
  }

  applyState();
  bind();
  resizeCanvas();
  cancelAnimationFrame(raf);
  animateParticles();
  updatePlayUi();
})();
