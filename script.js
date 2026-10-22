(() => {
  'use strict';

  const DEFAULTS = JSON.parse(JSON.stringify(window.SITE_CONFIG || {}));
  // New key on purpose: invalidates every old Spotify/avatar-path override from prior builds.
  const STORAGE_KEY = 'madison-profile-v7-rebuilt';
  const $ = id => document.getElementById(id);
  const clone = obj => JSON.parse(JSON.stringify(obj));

  const el = {
    video: $('bg-video'), bg: $('bg'), particles: $('particles'), glow: $('cursor-glow'), cursor: $('dot-cursor'),
    card: $('profile-card'), avatar: $('avatar'), decoration: $('avatar-decoration'), name: $('display-name'), nameSpan: $('display-name').querySelector('span'), handle: $('handle'), bio: $('bio'),
    connections: $('connections'), musicCard: $('music-card'), album: $('album-art'), audio: $('audio'), play: $('play-button'), progress: $('progress'), current: $('current-time'), duration: $('duration'), title: $('song-title'), artist: $('song-artist'), bars: [...document.querySelectorAll('#bars i')],
    panel: $('panel'), backdrop: $('panel-backdrop'), close: $('panel-close'), tabs: [...document.querySelectorAll('.tab')], sections: [...document.querySelectorAll('.panel-section')],
    linkEditor: $('link-editor'), saveLocal: $('save-local'), exportConfig: $('export-config'), resetLocal: $('reset-local'), saveStatus: $('save-status'), toast: $('toast')
  };

  const c = {
    name: $('cfg-name'), handle: $('cfg-handle'), bio: $('cfg-bio'), avatar: $('cfg-avatar'), decoration: $('cfg-decoration'),
    nameFont: $('cfg-name-font'), handleFont: $('cfg-handle-font'), nameColor: $('cfg-name-color'), handleColor: $('cfg-handle-color'), nameShimmer: $('cfg-name-shimmer'),
    audio: $('cfg-audio'), album: $('cfg-album'), songTitle: $('cfg-song-title'), songArtist: $('cfg-song-artist'), video: $('cfg-video'),
    background: $('cfg-background'), accent: $('cfg-accent'), cardOpacity: $('cfg-card-opacity'), cardBlur: $('cfg-card-blur'), cardWidth: $('cfg-card-width'),
    particles: $('cfg-particles'), cursorGlow: $('cfg-cursor-glow'), minimalCursor: $('cfg-minimal-cursor'), cardTilt: $('cfg-card-tilt'), backgroundShift: $('cfg-background-shift'), connectionLift: $('cfg-connection-lift'), particleCount: $('cfg-particle-count')
  };

  const out = { opacity: $('out-card-opacity'), blur: $('out-card-blur'), width: $('out-card-width'), particles: $('out-particles') };
  const fontMap = {
    'soft-serif': 'Georgia, "Times New Roman", serif',
    'classic-serif': '"Times New Roman", Times, serif',
    'soft-sans': '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif'
  };
  const icons = {
    discord:'<svg viewBox="0 0 24 24"><path d="M19.5 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.02a15.1 15.1 0 0 0-5.88 0L8.56 4A16.4 16.4 0 0 0 4.5 5.35C1.93 9.13 1.23 12.82 1.58 16.45a16.5 16.5 0 0 0 4.98 2.5l1.2-1.65a10.6 10.6 0 0 1-1.89-.9l.47-.37c3.64 1.68 7.6 1.68 11.2 0l.48.37c-.61.35-1.25.65-1.9.9l1.2 1.65a16.45 16.45 0 0 0 4.98-2.5c.42-4.2-.72-7.85-2.8-11.11ZM8.7 14.24c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.88 2.25-2 2.25Zm6.6 0c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.87 2.25-2 2.25Z"/></svg>',
    telegram:'<svg viewBox="0 0 24 24"><path d="M21.94 4.66 18.92 19c-.23 1.01-.82 1.26-1.66.78l-4.6-3.39-2.22 2.14c-.25.25-.45.45-.92.45l.33-4.68 8.51-7.69c.37-.33-.08-.52-.57-.19L7.27 13.05 2.74 11.64c-.98-.31-1-.98.2-1.45L20.66 3.36c.82-.3 1.54.2 1.28 1.3Z"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24"><path d="M16.7 3c.35 2.08 1.55 3.32 3.6 3.48v3.02a8.1 8.1 0 0 1-3.57-.83v6.25A6.08 6.08 0 1 1 11.48 8.9v3.07a3.05 3.05 0 1 0 2.22 2.95V3h3Z"/></svg>'
  };

  let config = loadConfig();
  let toastTimer = 0;
  let nameClicks = [];
  let armed = false;
  let secret = '';
  let armTimer = 0;
  let particleData = [];
  

  function loadConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return saved ? merge(DEFAULTS, saved) : clone(DEFAULTS);
    } catch { return clone(DEFAULTS); }
  }
  function merge(base, override) {
    const result = clone(base || {});
    if (!override || typeof override !== 'object') return result;
    for (const [key, value] of Object.entries(override)) {
      if (Array.isArray(value)) result[key] = clone(value);
      else if (value && typeof value === 'object') result[key] = merge(result[key] || {}, value);
      else result[key] = value;
    }
    return result;
  }
  function rgb(hex) {
    const h = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#aac6d1';
    return `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;
  }
  function time(sec) {
    if (!Number.isFinite(sec)) return '0:00';
    return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
  }
  function showToast(text) {
    clearTimeout(toastTimer);
    el.toast.textContent = text;
    el.toast.classList.add('show');
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1800);
  }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

  function renderConnections() {
    el.connections.replaceChildren();
    for (const item of config.connections || []) {
      let node;
      if (item.mode === 'link') {
        node = document.createElement('a');
        node.href = item.target || '#';
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
      } else {
        node = document.createElement('button');
        node.type = 'button';
      }
      node.className = `connection${item.mode === 'none' ? ' inert' : ''}`;
      node.innerHTML = `<span class="connection-icon">${icons[item.label?.toLowerCase()] || ''}</span><span class="connection-text"><span class="connection-label">${escapeHtml(item.label)}</span><span class="connection-value">${escapeHtml(item.value)}</span></span>${item.mode === 'copy' ? '<span class="copy-mark">copy</span>' : ''}`;
      if (item.mode === 'copy') node.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(item.target || item.value || ''); showToast(`${item.label} copied`); }
        catch { showToast(item.target || item.value || ''); }
      });
      if (item.mode === 'none') node.addEventListener('click', e => e.preventDefault());
      el.connections.appendChild(node);
    }
  }

  function setImage(img, src, fallbackClass = 'bad') {
    img.classList.remove(fallbackClass);
    img.src = src;
  }

  async function loadDecoration(url) {
    el.decoration.classList.remove('loaded','failed');
    el.decoration.removeAttribute('src');
    if (!url) { el.decoration.classList.add('failed'); return; }

    // The Discord CDN is the only remote asset on the page. Fetch it only after
    // the page is already visible, and abort aggressively so it can never leave
    // the browser stuck on "transferring data".
    await new Promise(resolve => setTimeout(resolve, 650));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(url, { signal: controller.signal, mode: 'cors', cache: 'force-cache' });
      if (!response.ok) throw new Error(`decoration HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      el.decoration.onload = () => { el.decoration.classList.add('loaded'); setTimeout(() => URL.revokeObjectURL(objectUrl), 1500); };
      el.decoration.onerror = () => { el.decoration.classList.add('failed'); URL.revokeObjectURL(objectUrl); };
      el.decoration.src = objectUrl;
    } catch (err) {
      el.decoration.classList.add('failed');
      console.warn('Avatar decoration could not be loaded quickly:', err);
    } finally {
      clearTimeout(timeout);
    }
  }

  function loadVideo(path) {
    el.video.pause();
    el.video.removeAttribute('src');
    el.video.classList.remove('active');
    if (!path) return;
    el.video.src = path;
    el.video.load();
    el.video.addEventListener('canplay', () => {
      el.video.classList.add('active');
      el.video.play().catch(() => {});
    }, {once:true});
    el.video.addEventListener('error', () => el.video.classList.remove('active'), {once:true});
  }

  function apply() {
    const p=config.profile||{}, m=config.media||{}, s=config.style||{}, f=config.effects||{};
    const root=document.documentElement.style;
    root.setProperty('--bg', s.background || '#aac6d1');
    root.setProperty('--accent', s.accent || '#aac6d1');
    root.setProperty('--accent-rgb', rgb(s.accent));
    root.setProperty('--card-opacity', String(s.cardOpacity ?? .42));
    root.setProperty('--card-blur', `${s.cardBlur ?? 18}px`);
    root.setProperty('--card-width', `${s.cardWidth ?? 470}px`);
    root.setProperty('--name-color', s.nameColor || '#f7fbfc');
    root.setProperty('--handle-color', s.handleColor || '#dce9ed');
    root.setProperty('--name-font', fontMap[s.nameFont] || fontMap['soft-serif']);
    root.setProperty('--handle-font', fontMap[s.handleFont] || fontMap['soft-sans']);

    el.nameSpan.textContent = p.name || 'madison';
    el.name.dataset.text = p.name || 'madison';
    el.handle.textContent = p.handle || '@madisonbeer';
    el.bio.textContent = p.bio || '';
    document.title = p.name || 'madison';

    setImage(el.avatar, p.avatar || 'assets/avatar-madison-v2.png');
    el.album.src = m.albumArt || 'assets/album-envy-the-leaves.png';
    el.title.textContent = m.songTitle || 'envy the leaves';
    el.artist.textContent = m.songArtist || 'madison beer';
    if (el.audio.getAttribute('src') !== (m.audio || 'assets/envy-the-leaves.mp3')) {
      el.audio.src = m.audio || 'assets/envy-the-leaves.mp3';
      el.audio.load();
    }
    loadVideo(m.video || '');
    loadDecoration(p.decoration || '');

    document.body.classList.toggle('name-shimmer-on', !!f.nameShimmer);
    document.body.classList.toggle('cursor-glow-on', !!f.cursorGlow);
    document.body.classList.toggle('minimal-cursor-on', !!f.minimalCursor);
    document.body.classList.toggle('connection-lift-on', f.connectionLift !== false);
    renderConnections();
    initParticles();
    fillPanel();
  }

  function fillPanel() {
    const p=config.profile||{}, m=config.media||{}, s=config.style||{}, f=config.effects||{};
    c.name.value=p.name||''; c.handle.value=p.handle||''; c.bio.value=p.bio||''; c.avatar.value=p.avatar||''; c.decoration.value=p.decoration||'';
    c.nameFont.value=s.nameFont||'soft-serif'; c.handleFont.value=s.handleFont||'soft-sans'; c.nameColor.value=s.nameColor||'#f7fbfc'; c.handleColor.value=s.handleColor||'#dce9ed'; c.nameShimmer.checked=!!f.nameShimmer;
    c.audio.value=m.audio||''; c.album.value=m.albumArt||''; c.songTitle.value=m.songTitle||''; c.songArtist.value=m.songArtist||''; c.video.value=m.video||'';
    c.background.value=s.background||'#aac6d1'; c.accent.value=s.accent||'#aac6d1'; c.cardOpacity.value=s.cardOpacity??.42; c.cardBlur.value=s.cardBlur??18; c.cardWidth.value=s.cardWidth??470;
    c.particles.checked=!!f.particles; c.cursorGlow.checked=!!f.cursorGlow; c.minimalCursor.checked=!!f.minimalCursor; c.cardTilt.checked=!!f.cardTilt; c.backgroundShift.checked=!!f.backgroundShift; c.connectionLift.checked=f.connectionLift!==false; c.particleCount.value=f.particleCount??30;
    out.opacity.textContent=Number(c.cardOpacity.value).toFixed(2); out.blur.textContent=`${c.cardBlur.value}px`; out.width.textContent=`${c.cardWidth.value}px`; out.particles.textContent=c.particleCount.value;
    renderLinkEditor();
  }

  function pull() {
    config.profile={name:c.name.value.trim()||'madison',handle:c.handle.value.trim()||'@madisonbeer',bio:c.bio.value.trim(),avatar:c.avatar.value.trim()||'assets/avatar-madison-v2.png',decoration:c.decoration.value.trim()};
    config.media={audio:c.audio.value.trim()||'assets/envy-the-leaves.mp3',albumArt:c.album.value.trim()||'assets/album-envy-the-leaves.png',songTitle:c.songTitle.value.trim()||'envy the leaves',songArtist:c.songArtist.value.trim()||'madison beer',video:c.video.value.trim(),autoplayMusic:false,showPlayer:true};
    config.style={...(config.style||{}),background:c.background.value,accent:c.accent.value,cardOpacity:Number(c.cardOpacity.value),cardBlur:Number(c.cardBlur.value),cardWidth:Number(c.cardWidth.value),nameFont:c.nameFont.value,handleFont:c.handleFont.value,nameColor:c.nameColor.value,handleColor:c.handleColor.value};
    config.effects={nameShimmer:c.nameShimmer.checked,particles:c.particles.checked,cursorGlow:c.cursorGlow.checked,minimalCursor:c.minimalCursor.checked,cardTilt:c.cardTilt.checked,backgroundShift:c.backgroundShift.checked,connectionLift:c.connectionLift.checked,particleCount:Number(c.particleCount.value)};
  }

  function live() { pull(); apply(); }

  function renderLinkEditor() {
    el.linkEditor.replaceChildren();
    (config.connections||[]).forEach((item,index)=>{
      const row=document.createElement('div'); row.className='link-row';
      row.innerHTML=`<label>platform<input data-k="label" type="text" value="${escapeHtml(item.label)}"></label><label>shown username<input data-k="value" type="text" value="${escapeHtml(item.value)}"></label><label>behavior<select data-k="mode"><option value="none" ${item.mode==='none'?'selected':''}>no action</option><option value="copy" ${item.mode==='copy'?'selected':''}>copy username</option><option value="link" ${item.mode==='link'?'selected':''}>open link</option></select></label><label>target<input data-k="target" type="text" value="${escapeHtml(item.target||'')}"></label>`;
      row.querySelectorAll('input,select').forEach(control=>control.addEventListener(control.tagName==='SELECT'?'change':'input',()=>{config.connections[index][control.dataset.k]=control.value;renderConnections();}));
      el.linkEditor.appendChild(row);
    });
  }

  function openPanel(){fillPanel();el.panel.classList.add('open');el.panel.setAttribute('aria-hidden','false');document.body.classList.add('panel-open')}
  function closePanel(){el.panel.classList.remove('open');el.panel.setAttribute('aria-hidden','true');document.body.classList.remove('panel-open')}
  function arm(){armed=true;secret='';clearTimeout(armTimer);armTimer=setTimeout(()=>{armed=false;secret=''},10000);showToast('type AHMED')}
  function handleNameClick(){const now=Date.now();nameClicks.push(now);nameClicks=nameClicks.filter(t=>now-t<1500);if(nameClicks.length>=3){nameClicks=[];arm()}}
  function handleSecret(e){if(!armed||e.ctrlKey||e.metaKey||e.altKey)return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.key.length!==1||!/[a-z]/i.test(e.key))return;secret=(secret+e.key.toLowerCase()).slice(-5);if(secret==='ahmed'){armed=false;clearTimeout(armTimer);openPanel()}}

  function animateBars(){
    const t = el.audio.currentTime || 0;
    if(!el.audio.paused){
      el.bars.forEach((bar,i)=>{
        const wave=(Math.sin(t*(3.1+i*.33)+i*1.2)+1)/2;
        bar.style.height=`${24+wave*66}%`;
      });
    } else {
      el.bars.forEach((bar,i)=>bar.style.height=`${22+(i%3)*9}%`);
    }
    requestAnimationFrame(animateBars);
  }
  async function toggleAudio(){
    if(el.audio.paused){
      try { await el.audio.play(); }
      catch(err){ console.error('Audio play failed',err); showToast('click play once more'); }
    } else {
      el.audio.pause();
    }
  }
  function updatePlay(){
    el.play.classList.toggle('playing',!el.audio.paused);
    el.play.setAttribute('aria-label',el.audio.paused?'play':'pause');
  }

  function initParticles(){const count=Number(config.effects?.particleCount||0);particleData=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.35+Math.random()*.8,a:.08+Math.random()*.2,vy:.018+Math.random()*.07,vx:(Math.random()-.5)*.05}))}
  function resizeCanvas(){const d=Math.min(devicePixelRatio||1,2);el.particles.width=innerWidth*d;el.particles.height=innerHeight*d;el.particles.style.width=`${innerWidth}px`;el.particles.style.height=`${innerHeight}px`;el.particles.getContext('2d').setTransform(d,0,0,d,0,0);initParticles()}
  function animateParticles(){const ctx=el.particles.getContext('2d');ctx.clearRect(0,0,innerWidth,innerHeight);if(config.effects?.particles){for(const p of particleData){p.x+=p.vx;p.y-=p.vy;if(p.y<-3){p.y=innerHeight+3;p.x=Math.random()*innerWidth}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.a})`;ctx.fill()}}requestAnimationFrame(animateParticles)}

  function bind(){
    el.avatar.addEventListener('load',()=>el.avatar.classList.remove('bad'));
    el.avatar.addEventListener('error',()=>{el.avatar.classList.add('bad');showToast('avatar file missing')});
    el.album.addEventListener('error',()=>{el.album.src='assets/avatar-madison-v2.png'});
    el.name.addEventListener('pointerdown',handleNameClick);
    document.addEventListener('keydown',handleSecret);
    el.close.addEventListener('click',closePanel);el.backdrop.addEventListener('click',closePanel);
    el.tabs.forEach(tab=>tab.addEventListener('click',()=>{el.tabs.forEach(t=>t.classList.toggle('active',t===tab));el.sections.forEach(s=>s.classList.toggle('active',s.dataset.section===tab.dataset.tab))}));

    Object.values(c).forEach(control=>{if(!control)return;const evt=control.type==='checkbox'||control.type==='color'||control.tagName==='SELECT'?'change':'input';control.addEventListener(evt,live)});
    document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{
      const name=btn.dataset.preset;
      if(name==='lighter'){config.style.cardOpacity=.31;config.style.cardBlur=16}
      if(name==='darker'){config.style.cardOpacity=.54;config.style.cardBlur=20}
      if(name==='current'){config.style.cardOpacity=.42;config.style.cardBlur=18}
      apply();
    }));
    el.saveLocal.addEventListener('click',()=>{pull();localStorage.setItem(STORAGE_KEY,JSON.stringify(config));el.saveStatus.textContent='saved in this browser';showToast('saved')});
    el.resetLocal.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);config=clone(DEFAULTS);apply();el.saveStatus.textContent='preview reset';showToast('reset')});
    el.exportConfig.addEventListener('click',()=>{pull();const blob=new Blob([`window.SITE_CONFIG = ${JSON.stringify(config,null,2)};\n`],{type:'text/javascript'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='site-config.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);el.saveStatus.textContent='site-config.js downloaded'});

    el.play.addEventListener('click',toggleAudio);el.audio.addEventListener('play',updatePlay);el.audio.addEventListener('pause',updatePlay);el.audio.addEventListener('loadedmetadata',()=>{el.duration.textContent=time(el.audio.duration)});el.audio.addEventListener('timeupdate',()=>{el.current.textContent=time(el.audio.currentTime);el.progress.value=el.audio.duration?String(el.audio.currentTime/el.audio.duration*100):'0'});el.progress.addEventListener('input',()=>{if(el.audio.duration)el.audio.currentTime=Number(el.progress.value)/100*el.audio.duration});

    window.addEventListener('mousemove',e=>{el.glow.style.left=`${e.clientX}px`;el.glow.style.top=`${e.clientY}px`;el.cursor.style.left=`${e.clientX}px`;el.cursor.style.top=`${e.clientY}px`;if(config.effects?.backgroundShift){const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*8;const tr=`translate3d(${x}px,${y}px,0) scale(1.025)`;el.bg.style.transform=tr;el.video.style.transform=tr}else{el.bg.style.transform='';el.video.style.transform=''}} ,{passive:true});
    el.card.addEventListener('mousemove',e=>{if(!config.effects?.cardTilt||innerWidth<700)return;const r=el.card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.card.style.transform=`perspective(1000px) rotateX(${(-y*2.6).toFixed(2)}deg) rotateY(${(x*3.4).toFixed(2)}deg)`});el.card.addEventListener('mouseleave',()=>el.card.style.transform='');
    window.addEventListener('resize',resizeCanvas,{passive:true});
  }

  apply();
  bind();
  resizeCanvas();
  animateParticles();
  animateBars();
})();
