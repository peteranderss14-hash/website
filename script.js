(() => {
  'use strict';

  const STORAGE_KEY = 'american-girl-profile-v1';
  const DEFAULTS = {
    profile: {
      name: 'madison',
      handle: '@madisonbeer',
      bio: '𓂃˖ ࣪⊹ they say that honest love is a cage that makes you feel free.',
      avatar: 'avatar.jpg'
    },
    connections: [
      { label: 'discord', value: 'madisonbeer', mode: 'copy', target: 'madisonbeer' },
      { label: 'telegram', value: 'eviltriad', mode: 'link', target: 'https://t.me/eviltriad' },
      { label: 'tiktok', value: '@pd', mode: 'static', target: '' }
    ],
    media: {
      audio: 'song.mp3',
      video: 'background.mp4',
      title: 'american girl',
      artist: 'tiffany day',
      autoplay: true
    },
    style: {
      accent: '#8eb8d4',
      nameColor: '#f7fbff',
      cardDarkness: 0.46,
      cardBlur: 18,
      videoDarkness: 0.33
    },
    effects: {
      shimmer: true,
      particles: true,
      cursorGlow: true,
      tilt: true,
      parallax: true
    }
  };

  const $ = id => document.getElementById(id);
  const clone = v => JSON.parse(JSON.stringify(v));
  const els = {
    video: $('backgroundVideo'), audio: $('audioPlayer'), enter: $('enterScreen'), card: $('profileCard'),
    avatar: $('avatar'), name: $('displayName'), nameSpan: $('displayName').querySelector('span'), handle: $('handle'), bio: $('bio'),
    connections: $('connections'), title: $('songTitle'), artist: $('songArtist'), play: $('playButton'), progress: $('progress'), current: $('currentTime'), duration: $('duration'),
    glow: $('cursorGlow'), particles: $('particles'), cursor: $('dotCursor'), toast: $('toast'),
    panel: $('adminPanel'), backdrop: $('panelBackdrop'), closePanel: $('closePanel'), tabs: [...document.querySelectorAll('.panel-tab')], sections: [...document.querySelectorAll('.panel-section')],
    adminName: $('adminName'), adminHandle: $('adminHandle'), adminBio: $('adminBio'), adminAvatar: $('adminAvatar'),
    adminSongTitle: $('adminSongTitle'), adminSongArtist: $('adminSongArtist'), adminAudio: $('adminAudio'), adminVideo: $('adminVideo'), adminAutoplay: $('adminAutoplay'),
    adminAccent: $('adminAccent'), adminNameColor: $('adminNameColor'), adminCardDarkness: $('adminCardDarkness'), adminCardBlur: $('adminCardBlur'), adminVideoDarkness: $('adminVideoDarkness'),
    adminNameShimmer: $('adminNameShimmer'), adminParticles: $('adminParticles'), adminCursorGlow: $('adminCursorGlow'), adminTilt: $('adminTilt'), adminParallax: $('adminParallax'),
    cardDarknessValue: $('cardDarknessValue'), cardBlurValue: $('cardBlurValue'), videoDarknessValue: $('videoDarknessValue'), saveLocal: $('saveLocal'), resetLocal: $('resetLocal')
  };

  let config = loadConfig();
  let toastTimer;
  let entered = false;
  let nameClicks = [];
  let secretArmed = false;
  let secretBuffer = '';
  let secretTimer;
  let particleList = [];
  let raf;

  function merge(base, override) {
    const out = clone(base);
    if (!override || typeof override !== 'object') return out;
    Object.entries(override).forEach(([k,v]) => {
      if (Array.isArray(v)) out[k] = clone(v);
      else if (v && typeof v === 'object' && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) out[k] = merge(out[k], v);
      else out[k] = v;
    });
    return out;
  }

  function loadConfig() {
    try { return merge(DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
    catch { return clone(DEFAULTS); }
  }

  function hexToRgb(hex) {
    const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#8eb8d4';
    return `${parseInt(safe.slice(1,3),16)},${parseInt(safe.slice(3,5),16)},${parseInt(safe.slice(5,7),16)}`;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  const icons = {
    discord: '<svg viewBox="0 0 24 24"><path d="M19.5 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.02a15.1 15.1 0 0 0-5.88 0L8.56 4A16.4 16.4 0 0 0 4.5 5.35C1.93 9.13 1.23 12.82 1.58 16.45a16.5 16.5 0 0 0 4.98 2.5l1.2-1.65a10.6 10.6 0 0 1-1.89-.9l.47-.37c3.64 1.68 7.6 1.68 11.2 0l.48.37c-.61.35-1.25.65-1.9.9l1.2 1.65a16.45 16.45 0 0 0 4.98-2.5c.42-4.2-.72-7.85-2.8-11.11ZM8.7 14.24c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.88 2.25-2 2.25Zm6.6 0c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.87 2.25-2 2.25Z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M21.94 4.66 18.92 19c-.23 1.01-.82 1.26-1.66.78l-4.6-3.39-2.22 2.14c-.25.25-.45.45-.92.45l.33-4.68 8.51-7.69c.37-.33-.08-.52-.57-.19L7.27 13.05 2.74 11.64c-.98-.31-1-.98.2-1.45L20.66 3.36c.82-.3 1.54.2 1.28 1.3Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M16.7 3c.35 2.08 1.55 3.32 3.6 3.48v3.02a8.1 8.1 0 0 1-3.57-.83v6.25A6.08 6.08 0 1 1 11.48 8.9v3.07a3.05 3.05 0 1 0 2.22 2.95V3h3Z"/></svg>'
  };

  function renderConnections() {
    els.connections.replaceChildren();
    config.connections.forEach(item => {
      const node = item.mode === 'link' ? document.createElement('a') : document.createElement('button');
      node.className = `connection${item.mode === 'static' ? ' static' : ''}`;
      if (node.tagName === 'BUTTON') node.type = 'button';
      node.innerHTML = `<span class="connection-icon">${icons[item.label.toLowerCase()] || icons.tiktok}</span><span class="connection-text"><span class="connection-label">${esc(item.label)}</span><span class="connection-value">${esc(item.value)}</span></span><span class="connection-action">${item.mode === 'copy' ? 'copy' : item.mode === 'link' ? '↗' : ''}</span>`;
      if (item.mode === 'copy') node.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(item.target); showToast(`${item.label} copied`); }
        catch { showToast(item.target); }
      });
      if (item.mode === 'link') { node.href = item.target; node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      els.connections.appendChild(node);
    });
  }

  function applyConfig() {
    const root = document.documentElement.style;
    root.setProperty('--accent', config.style.accent);
    root.setProperty('--accent-rgb', hexToRgb(config.style.accent));
    root.setProperty('--name', config.style.nameColor);
    root.setProperty('--card-darkness', config.style.cardDarkness);
    root.setProperty('--card-blur', `${config.style.cardBlur}px`);
    root.setProperty('--video-darkness', config.style.videoDarkness);

    els.nameSpan.textContent = config.profile.name;
    els.name.dataset.text = config.profile.name;
    els.handle.textContent = config.profile.handle;
    els.bio.textContent = config.profile.bio;
    els.avatar.src = config.profile.avatar;
    els.title.textContent = config.media.title;
    els.artist.textContent = config.media.artist;
    document.title = config.profile.name;

    document.body.classList.toggle('shimmer-on', !!config.effects.shimmer);
    document.body.classList.toggle('glow-on', !!config.effects.cursorGlow);
    renderConnections();
    fillPanel();
    initParticles();
  }

  function fillPanel() {
    els.adminName.value = config.profile.name;
    els.adminHandle.value = config.profile.handle;
    els.adminBio.value = config.profile.bio;
    els.adminAvatar.value = config.profile.avatar;
    els.adminSongTitle.value = config.media.title;
    els.adminSongArtist.value = config.media.artist;
    els.adminAudio.value = config.media.audio;
    els.adminVideo.value = config.media.video;
    els.adminAutoplay.checked = config.media.autoplay;
    els.adminAccent.value = config.style.accent;
    els.adminNameColor.value = config.style.nameColor;
    els.adminCardDarkness.value = config.style.cardDarkness;
    els.adminCardBlur.value = config.style.cardBlur;
    els.adminVideoDarkness.value = config.style.videoDarkness;
    els.adminNameShimmer.checked = config.effects.shimmer;
    els.adminParticles.checked = config.effects.particles;
    els.adminCursorGlow.checked = config.effects.cursorGlow;
    els.adminTilt.checked = config.effects.tilt;
    els.adminParallax.checked = config.effects.parallax;
    els.cardDarknessValue.textContent = Number(config.style.cardDarkness).toFixed(2);
    els.cardBlurValue.textContent = `${config.style.cardBlur}px`;
    els.videoDarknessValue.textContent = Number(config.style.videoDarkness).toFixed(2);
  }

  function pullPanel() {
    config.profile.name = els.adminName.value.trim() || 'madison';
    config.profile.handle = els.adminHandle.value.trim() || '@madisonbeer';
    config.profile.bio = els.adminBio.value.trim();
    config.profile.avatar = els.adminAvatar.value.trim() || 'avatar.jpg';
    config.media.title = els.adminSongTitle.value.trim() || 'american girl';
    config.media.artist = els.adminSongArtist.value.trim() || 'tiffany day';
    config.media.audio = els.adminAudio.value.trim() || 'song.mp3';
    config.media.video = els.adminVideo.value.trim() || 'background.mp4';
    config.media.autoplay = els.adminAutoplay.checked;
    config.style.accent = els.adminAccent.value;
    config.style.nameColor = els.adminNameColor.value;
    config.style.cardDarkness = Number(els.adminCardDarkness.value);
    config.style.cardBlur = Number(els.adminCardBlur.value);
    config.style.videoDarkness = Number(els.adminVideoDarkness.value);
    config.effects.shimmer = els.adminNameShimmer.checked;
    config.effects.particles = els.adminParticles.checked;
    config.effects.cursorGlow = els.adminCursorGlow.checked;
    config.effects.tilt = els.adminTilt.checked;
    config.effects.parallax = els.adminParallax.checked;
  }

  function liveUpdate() { pullPanel(); applyConfig(); }

  function formatTime(sec) {
    if (!Number.isFinite(sec)) return '0:00';
    return `${Math.floor(sec/60)}:${Math.floor(sec%60).toString().padStart(2,'0')}`;
  }

  function loadMediaAndEnter() {
    if (entered) return;
    entered = true;
    document.body.classList.add('entered');
    els.enter.classList.add('hidden');

    if (!els.video.getAttribute('src')) {
      els.video.src = config.media.video;
      els.video.load();
    }
    if (!els.audio.getAttribute('src')) {
      els.audio.src = config.media.audio;
      els.audio.load();
    }

    const syncVideo = () => {
      try { els.video.currentTime = els.audio.currentTime || 0; } catch {}
      els.video.play().catch(() => {});
    };

    if (config.media.autoplay) {
      els.audio.play().then(syncVideo).catch(() => showToast('tap play to start music'));
    } else {
      syncVideo();
    }
  }

  function togglePlayback() {
    if (!entered) loadMediaAndEnter();
    if (els.audio.paused) {
      els.audio.play().then(() => {
        try { els.video.currentTime = els.audio.currentTime; } catch {}
        els.video.play().catch(() => {});
      }).catch(() => showToast('song.mp3 could not be played'));
    } else {
      els.audio.pause();
      els.video.pause();
    }
  }

  function updatePlayState() {
    const playing = !els.audio.paused;
    els.play.classList.toggle('playing', playing);
    if (playing) els.video.play().catch(() => {});
  }

  function showToast(text) {
    clearTimeout(toastTimer);
    els.toast.textContent = text;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function openPanel() {
    fillPanel();
    els.panel.classList.add('open');
    els.panel.setAttribute('aria-hidden','false');
    els.backdrop.classList.add('show');
  }
  function closePanel() {
    els.panel.classList.remove('open');
    els.panel.setAttribute('aria-hidden','true');
    els.backdrop.classList.remove('show');
  }

  function handleNameClick() {
    const now = Date.now();
    nameClicks.push(now);
    nameClicks = nameClicks.filter(t => now - t < 1400);
    if (nameClicks.length >= 3) {
      nameClicks = [];
      secretArmed = true;
      secretBuffer = '';
      clearTimeout(secretTimer);
      secretTimer = setTimeout(() => { secretArmed = false; secretBuffer = ''; }, 10000);
      showToast('type AHMED');
    }
  }

  function handleSecretKey(e) {
    if (!secretArmed || e.ctrlKey || e.altKey || e.metaKey) return;
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
    secretBuffer = (secretBuffer + e.key.toLowerCase()).slice(-5);
    if (secretBuffer === 'ahmed') {
      secretArmed = false;
      secretBuffer = '';
      openPanel();
    }
  }

  function resizeParticles() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    els.particles.width = innerWidth * dpr;
    els.particles.height = innerHeight * dpr;
    els.particles.style.width = `${innerWidth}px`;
    els.particles.style.height = `${innerHeight}px`;
    els.particles.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    initParticles();
  }
  function initParticles() {
    const count = config.effects.particles ? 28 : 0;
    particleList = Array.from({length:count}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*.9+.2,vy:-(Math.random()*.08+.025),vx:(Math.random()-.5)*.05,a:Math.random()*.22+.04}));
  }
  function animateParticles() {
    const ctx = els.particles.getContext('2d');
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if (config.effects.particles) {
      particleList.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = innerHeight+4; p.x = Math.random()*innerWidth; }
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(220,241,252,${p.a})`;ctx.fill();
      });
    }
    raf = requestAnimationFrame(animateParticles);
  }

  function bindEvents() {
    els.enter.addEventListener('click', loadMediaAndEnter);
    els.enter.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') loadMediaAndEnter(); });
    els.play.addEventListener('click', togglePlayback);
    els.audio.addEventListener('play', updatePlayState);
    els.audio.addEventListener('pause', updatePlayState);
    els.audio.addEventListener('loadedmetadata', () => els.duration.textContent = formatTime(els.audio.duration));
    els.audio.addEventListener('timeupdate', () => {
      els.current.textContent = formatTime(els.audio.currentTime);
      els.progress.value = els.audio.duration ? (els.audio.currentTime / els.audio.duration) * 100 : 0;
      if (!els.video.paused && Number.isFinite(els.video.currentTime) && Math.abs(els.video.currentTime - els.audio.currentTime) > .45) {
        try { els.video.currentTime = els.audio.currentTime; } catch {}
      }
    });
    els.progress.addEventListener('input', () => {
      if (!els.audio.duration) return;
      els.audio.currentTime = (Number(els.progress.value) / 100) * els.audio.duration;
      try { els.video.currentTime = els.audio.currentTime; } catch {}
    });
    els.video.addEventListener('canplay', () => {
      els.video.classList.add('ready');
      if (!els.audio.paused) {
        try { els.video.currentTime = els.audio.currentTime; } catch {}
        els.video.play().catch(() => {});
      }
    });
    els.video.addEventListener('error', () => showToast('background.mp4 could not be loaded'));
    els.audio.addEventListener('error', () => showToast('song.mp3 could not be loaded'));

    els.name.addEventListener('click', handleNameClick);
    document.addEventListener('keydown', handleSecretKey);
    els.closePanel.addEventListener('click', closePanel);
    els.backdrop.addEventListener('click', closePanel);
    els.tabs.forEach(tab => tab.addEventListener('click', () => {
      els.tabs.forEach(t => t.classList.toggle('active', t === tab));
      els.sections.forEach(s => s.classList.toggle('active', s.dataset.section === tab.dataset.tab));
    }));

    [els.adminName,els.adminHandle,els.adminBio,els.adminAvatar,els.adminSongTitle,els.adminSongArtist,els.adminAudio,els.adminVideo,els.adminAccent,els.adminNameColor,els.adminCardDarkness,els.adminCardBlur,els.adminVideoDarkness].forEach(control => control.addEventListener('input', liveUpdate));
    [els.adminAutoplay,els.adminNameShimmer,els.adminParticles,els.adminCursorGlow,els.adminTilt,els.adminParallax].forEach(control => control.addEventListener('change', liveUpdate));
    els.saveLocal.addEventListener('click', () => { pullPanel(); localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); showToast('saved'); });
    els.resetLocal.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); config = clone(DEFAULTS); applyConfig(); showToast('reset'); });

    els.card.addEventListener('mousemove', e => {
      if (!config.effects.tilt || innerWidth < 720) return;
      const r = els.card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      els.card.style.transform = `perspective(1100px) rotateX(${(-y*2.6).toFixed(2)}deg) rotateY(${(x*3.6).toFixed(2)}deg)`;
    });
    els.card.addEventListener('mouseleave', () => els.card.style.transform = '');

    window.addEventListener('mousemove', e => {
      els.glow.style.left = `${e.clientX}px`; els.glow.style.top = `${e.clientY}px`;
      els.cursor.style.left = `${e.clientX}px`; els.cursor.style.top = `${e.clientY}px`;
      if (config.effects.parallax && entered) {
        const x=(e.clientX/innerWidth-.5)*8, y=(e.clientY/innerHeight-.5)*8;
        els.video.style.transform = `translate3d(${x}px,${y}px,0) scale(1.04)`;
      }
    }, {passive:true});
    window.addEventListener('resize', resizeParticles, {passive:true});
  }

  applyConfig();
  bindEvents();
  resizeParticles();
  if (raf) cancelAnimationFrame(raf);
  animateParticles();
})();
