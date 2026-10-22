(() => {
  "use strict";

  const DEFAULT_CONFIG = window.SITE_CONFIG || {};
  const STORAGE_KEY = "profile-site-config-v3";
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));

  const els = {
    loader: $("page-loader"),
    video: $("bg-video"),
    fallback: $("background-fallback"),
    vignette: $("vignette"),
    particles: $("particles"),
    glow: $("cursor-glow"),
    cursor: $("custom-cursor"),
    card: $("profile-card"),
    avatar: $("avatar"),
    avatarDecoration: $("avatar-decoration"),
    name: $("display-name"),
    nameInner: $("display-name-inner"),
    handle: $("handle"),
    bio: $("bio"),
    connections: $("connections"),
    musicCard: $("music-card"),
    albumArt: $("album-art"),
    bars: [...document.querySelectorAll("#music-bars span")],
    spotifyEmbed: $("spotify-embed"),
    spotifyLink: $("spotify-link"),
    progress: $("track-progress"),
    current: $("current-time"),
    duration: $("duration"),
    songTitle: $("song-title"),
    songArtist: $("song-artist"),
    panel: $("admin-panel"),
    closePanel: $("close-admin"),
    closeHitbox: $("admin-close-hitbox"),
    tabs: [...document.querySelectorAll(".admin-tab")],
    sections: [...document.querySelectorAll(".admin-section")],
    connectionEditor: $("admin-connections"),
    addConnection: $("add-connection"),
    presetButtons: [...document.querySelectorAll(".preset-button")],
    saveLocal: $("save-local"),
    exportConfig: $("export-config"),
    resetLocal: $("reset-local"),
    saveMessage: $("save-message"),
    toast: $("toast")
  };

  const controls = {
    name: $("admin-name"), handle: $("admin-handle"), bio: $("admin-bio"), avatar: $("admin-avatar"), decoration: $("admin-decoration"),
    nameFont: $("admin-name-font"), nameColor: $("admin-name-color"), nameColor2: $("admin-name-color-2"), nameColor3: $("admin-name-color-3"), nameSize: $("admin-name-size"), nameSpacing: $("admin-name-spacing"), nameSpeed: $("admin-name-speed"), nameRgb: $("admin-name-rgb"), nameShimmer: $("admin-name-shimmer"), nameOutline: $("admin-name-outline"), nameShadow: $("admin-name-shadow"),
    video: $("admin-video"), spotifyUrl: $("admin-spotify-url"), albumArt: $("admin-album-art"), songTitle: $("admin-song-title"), songArtist: $("admin-song-artist"), autoplay: $("admin-autoplay"), showPlayer: $("admin-show-player"),
    font: $("admin-font"), accent: $("admin-accent"), overlay: $("admin-overlay"), cardOpacity: $("admin-card-opacity"), blur: $("admin-blur"), width: $("admin-width"), radius: $("admin-radius"), border: $("admin-border"),
    particles: $("admin-particles"), cursorGlow: $("admin-cursor-glow"), shimmer: $("admin-shimmer"), vignette: $("admin-vignette"), cardTilt: $("admin-card-tilt"), backgroundShift: $("admin-background-shift"), minimalCursor: $("admin-minimal-cursor"), particleCount: $("admin-particle-count")
  };

  const valueLabels = {
    overlay: $("overlay-value"), cardOpacity: $("card-opacity-value"), blur: $("blur-value"), width: $("width-value"), radius: $("radius-value"), particleCount: $("particle-value"), nameSize: $("name-size-value"), nameSpacing: $("name-spacing-value"), nameSpeed: $("name-speed-value")
  };

  const iconMap = {
    discord: '<svg viewBox="0 0 24 24"><path d="M19.5 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.02a15.1 15.1 0 0 0-5.88 0L8.56 4A16.4 16.4 0 0 0 4.5 5.35C1.93 9.13 1.23 12.82 1.58 16.45a16.5 16.5 0 0 0 4.98 2.5l1.2-1.65a10.6 10.6 0 0 1-1.89-.9l.47-.37c3.64 1.68 7.6 1.68 11.2 0l.48.37c-.61.35-1.25.65-1.9.9l1.2 1.65a16.45 16.45 0 0 0 4.98-2.5c.42-4.2-.72-7.85-2.8-11.11ZM8.7 14.24c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.88 2.25-2 2.25Zm6.6 0c-1.1 0-2-1.01-2-2.25s.88-2.25 2-2.25c1.13 0 2.02 1.02 2 2.25 0 1.24-.87 2.25-2 2.25Z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M21.94 4.66 18.92 19c-.23 1.01-.82 1.26-1.66.78l-4.6-3.39-2.22 2.14c-.25.25-.45.45-.92.45l.33-4.68 8.51-7.69c.37-.33-.08-.52-.57-.19L7.27 13.05 2.74 11.64c-.98-.31-1-.98.2-1.45L20.66 3.36c.82-.3 1.54.2 1.28 1.3Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M16.7 3c.35 2.08 1.55 3.32 3.6 3.48v3.02a8.1 8.1 0 0 1-3.57-.83v6.25A6.08 6.08 0 1 1 11.48 8.9v3.07a3.05 3.05 0 1 0 2.22 2.95V3h3Z"/></svg>'
  };

  const PRESETS = {
    locket: {
      style: { accent: "#dcecff", overlay: 0.22, cardOpacity: 0.12, blur: 22, width: 470, radius: 28, border: true, font: "DM Sans" },
      nameStyle: { font: "Playfair Display", color: "#f7fbff", color2: "#d5e9ff", color3: "#eef2ff", size: 62, spacing: -1, speed: 5, rgb: false, shimmer: true, outline: false, shadow: true },
      effects: { particles: true, cursorGlow: true, shimmer: true, vignette: true, cardTilt: true, backgroundShift: true, minimalCursor: true, particleCount: 34 }
    },
    minimal: {
      style: { accent: "#eef5ff", overlay: 0.16, cardOpacity: 0.08, blur: 18, width: 440, radius: 26, border: true, font: "DM Sans" },
      nameStyle: { font: "Cormorant Garamond", color: "#ffffff", color2: "#dbe9ff", color3: "#f5f8ff", size: 58, spacing: -1, speed: 5, rgb: false, shimmer: false, outline: false, shadow: true },
      effects: { particles: false, cursorGlow: true, shimmer: false, vignette: true, cardTilt: true, backgroundShift: false, minimalCursor: true, particleCount: 0 }
    },
    soft: {
      style: { accent: "#cfe3ff", overlay: 0.26, cardOpacity: 0.16, blur: 26, width: 500, radius: 30, border: true, font: "Outfit" },
      nameStyle: { font: "Playfair Display", color: "#ffffff", color2: "#dce9ff", color3: "#ffffff", size: 64, spacing: -1.5, speed: 6, rgb: false, shimmer: true, outline: true, shadow: true },
      effects: { particles: true, cursorGlow: true, shimmer: true, vignette: true, cardTilt: true, backgroundShift: true, minimalCursor: true, particleCount: 44 }
    }
  };

  let config = loadConfig();
  let particles = [];
  let animationId = null;
  let toastTimer = null;
  let secretBuffer = "";
  let secretArmed = false;
  let armTimeout = null;
  let nameClicks = [];
  let spotifyController = null;
  let spotifyReady = false;
  let spotifyState = { isPaused: true, duration: 199000, position: 0 };

  function deepMerge(base, override) {
    const out = clone(base || {});
    if (!override || typeof override !== "object") return out;
    Object.entries(override).forEach(([key, value]) => {
      if (Array.isArray(value)) out[key] = clone(value);
      else if (value && typeof value === "object") out[key] = deepMerge(out[key] || {}, value);
      else out[key] = value;
    });
    return out;
  }

  function loadConfig() {
    try { return deepMerge(DEFAULT_CONFIG, JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")); }
    catch { return clone(DEFAULT_CONFIG); }
  }

  function rgbFromHex(hex) {
    const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#dcecff";
    return [parseInt(safe.slice(1,3),16), parseInt(safe.slice(3,5),16), parseInt(safe.slice(5,7),16)].join(", ");
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function safeTarget(target) {
    const value = (target || "#").trim();
    if (value === "#") return "#";
    try {
      const parsed = new URL(value, window.location.href);
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? value : "#";
    } catch {
      return "#";
    }
  }

  function getPlatformIcon(label, target) {
    const haystack = `${label} ${target}`.toLowerCase();
    if (haystack.includes("discord")) return iconMap.discord;
    if (haystack.includes("telegram") || haystack.includes("t.me")) return iconMap.telegram;
    if (haystack.includes("tiktok")) return iconMap.tiktok;
    return '<svg viewBox="0 0 24 24"><path d="M13.5 5.5a4 4 0 0 1 5.66 5.66l-2.83 2.83-1.42-1.42 2.83-2.83a2 2 0 1 0-2.83-2.83l-2.12 2.12-1.42-1.42 2.13-2.11Zm-3.08 4.9 1.42 1.42-2.82 2.83a2 2 0 0 0 2.83 2.83l2.12-2.12 1.42 1.42-2.13 2.12A4 4 0 0 1 7.6 13.24l2.82-2.83Zm5.66-1.4 1.42 1.42-6.36 6.36-1.42-1.42L16.08 9Z"/></svg>';
  }

  function renderConnections() {
    els.connections.replaceChildren();
    (config.connections || []).forEach(item => {
      const button = document.createElement(item.mode === "copy" ? "button" : "a");
      button.className = "connection";
      button.title = `${item.label} · ${item.value}`;
      button.innerHTML = `
        <span class="connection-icon">${getPlatformIcon(item.label, item.target)}</span>
        <span class="connection-text">
          <span class="connection-platform">${escapeHtml(item.label || "Link")}</span>
          <span class="connection-value">${escapeHtml(item.value || "")}</span>
        </span>
        ${item.mode === "copy" ? '<svg class="connection-copy" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 9V5.75A1.75 1.75 0 0 1 10.75 4h8.5A1.75 1.75 0 0 1 21 5.75v8.5A1.75 1.75 0 0 1 19.25 16H16v2.25A1.75 1.75 0 0 1 14.25 20h-8.5A1.75 1.75 0 0 1 4 18.25v-8.5A1.75 1.75 0 0 1 5.75 8H9Zm1.5 0h3.75A1.75 1.75 0 0 1 16 10.75V14.5h3.5V5.5h-9V9Zm4 10v-8.5h-9V19h9Z"/></svg>' : ""}
      `;
      if (item.mode === "copy") {
        button.type = "button";
        button.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(item.target || item.value || "");
            showToast(`${item.label} copied`);
          } catch {
            showToast(`Copy this: ${item.target || item.value || ""}`);
          }
        });
      } else {
        button.href = safeTarget(item.target);
        button.target = "_blank";
        button.rel = "noopener noreferrer";
      }
      els.connections.appendChild(button);
    });
  }

  function applyConfig() {
    const p = config.profile || {}, m = config.media || {}, s = config.style || {}, n = config.nameStyle || {}, e = config.effects || {};
    const root = document.documentElement.style;
    root.setProperty("--accent", s.accent || "#dcecff");
    root.setProperty("--accent-rgb", rgbFromHex(s.accent || "#dcecff"));
    root.setProperty("--overlay", String(s.overlay ?? .22));
    root.setProperty("--card-opacity", String(s.cardOpacity ?? .12));
    root.setProperty("--card-blur", `${Number(s.blur ?? 22)}px`);
    root.setProperty("--card-width", `${Number(s.width ?? 470)}px`);
    root.setProperty("--card-radius", `${Number(s.radius ?? 28)}px`);
    root.setProperty("--page-font", `"${(s.font || "DM Sans").replace(/["\\]/g, "")}", sans-serif`);
    root.setProperty("--name-font", `"${(n.font || "Playfair Display").replace(/["\\]/g, "")}", serif`);
    root.setProperty("--name-color", n.color || "#f7fbff");
    root.setProperty("--name-color-2", n.color2 || "#d5e9ff");
    root.setProperty("--name-color-3", n.color3 || "#eef2ff");
    root.setProperty("--name-size", `${Number(n.size ?? 62)}px`);
    root.setProperty("--name-spacing", `${Number(n.spacing ?? -1)}px`);
    root.setProperty("--name-speed", `${Number(n.speed ?? 5)}s`);

    els.nameInner.textContent = p.name || "madison";
    els.name.dataset.text = p.name || "madison";
    els.handle.textContent = p.handle || "@madisonbeer";
    els.bio.textContent = p.bio || "";
    document.title = p.name || "madison";

    els.songTitle.textContent = m.songTitle || "Song Name";
    els.songArtist.textContent = m.songArtist || "Artist";
    els.musicCard.classList.toggle("hidden", !m.showPlayer);

    els.avatar.src = p.avatar || "assets/avatar.jpg";
    els.avatar.classList.remove("is-missing");
    els.avatarDecoration.src = p.decoration || "";
    els.avatarDecoration.classList.toggle("is-missing", !p.decoration);

    els.albumArt.src = m.albumArt || p.avatar || "assets/avatar.jpg";

    els.spotifyLink.href = m.spotifyUrl || "https://open.spotify.com/track/2HgvorjycrfcCHEhVCCErk";
    if (spotifyController && m.spotifyUrl) {
      try { spotifyController.loadEntity(m.spotifyUrl); } catch {}
    }
    const source = els.video.querySelector("source");
    if (source.getAttribute("src") !== (m.video || "")) {
      source.src = m.video || "";
      els.video.load();
    }
    els.video.muted = true;

    els.card.classList.toggle("with-border", s.border !== false);
    ["rgb", "shimmer", "outline", "shadow"].forEach(key => document.body.classList.toggle(`name-${key}`, !!n[key]));
    document.body.classList.toggle("connection-shimmer", !!e.shimmer);
    document.body.classList.toggle("card-tilt", !!e.cardTilt);
    document.body.classList.toggle("minimal-cursor", !!e.minimalCursor);
    els.vignette.classList.toggle("enabled", !!e.vignette);
    els.glow.classList.toggle("enabled", !!e.cursorGlow);
    els.particles.style.display = e.particles ? "block" : "none";

    renderConnections();
    updateValueLabels();
    initParticles();
  }

  function fillPanel() {
    const p = config.profile || {}, m = config.media || {}, s = config.style || {}, n = config.nameStyle || {}, e = config.effects || {};
    controls.name.value = p.name || "";
    controls.handle.value = p.handle || "";
    controls.bio.value = p.bio || "";
    controls.avatar.value = p.avatar || "";
    controls.decoration.value = p.decoration || "";

    controls.nameFont.value = n.font || "Playfair Display";
    controls.nameColor.value = n.color || "#f7fbff";
    controls.nameColor2.value = n.color2 || "#d5e9ff";
    controls.nameColor3.value = n.color3 || "#eef2ff";
    controls.nameSize.value = n.size ?? 62;
    controls.nameSpacing.value = n.spacing ?? -1;
    controls.nameSpeed.value = n.speed ?? 5;
    controls.nameRgb.checked = !!n.rgb;
    controls.nameShimmer.checked = !!n.shimmer;
    controls.nameOutline.checked = !!n.outline;
    controls.nameShadow.checked = !!n.shadow;

    controls.video.value = m.video || "";
    controls.spotifyUrl.value = m.spotifyUrl || "";
    controls.albumArt.value = m.albumArt || "";
    controls.songTitle.value = m.songTitle || "";
    controls.songArtist.value = m.songArtist || "";
    controls.autoplay.checked = m.autoplayMusic !== false;
    controls.showPlayer.checked = m.showPlayer !== false;

    controls.font.value = s.font || "DM Sans";
    controls.accent.value = s.accent || "#dcecff";
    controls.overlay.value = s.overlay ?? .22;
    controls.cardOpacity.value = s.cardOpacity ?? .12;
    controls.blur.value = s.blur ?? 22;
    controls.width.value = s.width ?? 470;
    controls.radius.value = s.radius ?? 28;
    controls.border.checked = s.border !== false;

    controls.particles.checked = !!e.particles;
    controls.cursorGlow.checked = !!e.cursorGlow;
    controls.shimmer.checked = !!e.shimmer;
    controls.vignette.checked = !!e.vignette;
    controls.cardTilt.checked = !!e.cardTilt;
    controls.backgroundShift.checked = !!e.backgroundShift;
    controls.minimalCursor.checked = !!e.minimalCursor;
    controls.particleCount.value = e.particleCount ?? 34;

    renderConnectionEditor();
  }

  function pullPanelIntoConfig() {
    config.profile = {
      name: controls.name.value.trim() || "madison",
      handle: controls.handle.value.trim() || "@madisonbeer",
      bio: controls.bio.value.trim() || "",
      avatar: controls.avatar.value.trim() || "assets/avatar.jpg",
      decoration: controls.decoration.value.trim()
    };
    config.nameStyle = {
      font: controls.nameFont.value,
      color: controls.nameColor.value,
      color2: controls.nameColor2.value,
      color3: controls.nameColor3.value,
      size: Number(controls.nameSize.value),
      spacing: Number(controls.nameSpacing.value),
      speed: Number(controls.nameSpeed.value),
      rgb: controls.nameRgb.checked,
      shimmer: controls.nameShimmer.checked,
      outline: controls.nameOutline.checked,
      shadow: controls.nameShadow.checked
    };
    config.media = {
      video: controls.video.value.trim() || "assets/background.mp4",
      spotifyUrl: controls.spotifyUrl.value.trim() || "https://open.spotify.com/track/2HgvorjycrfcCHEhVCCErk",
      albumArt: controls.albumArt.value.trim() || (config.profile?.avatar || "assets/avatar.jpg"),
      songTitle: controls.songTitle.value.trim() || "Envy the Leaves",
      songArtist: controls.songArtist.value.trim() || "Madison Beer",
      autoplayMusic: controls.autoplay.checked,
      showPlayer: controls.showPlayer.checked
    };
    config.style = {
      font: controls.font.value,
      accent: controls.accent.value,
      overlay: Number(controls.overlay.value),
      cardOpacity: Number(controls.cardOpacity.value),
      blur: Number(controls.blur.value),
      width: Number(controls.width.value),
      radius: Number(controls.radius.value),
      border: controls.border.checked
    };
    config.effects = {
      particles: controls.particles.checked,
      cursorGlow: controls.cursorGlow.checked,
      shimmer: controls.shimmer.checked,
      vignette: controls.vignette.checked,
      cardTilt: controls.cardTilt.checked,
      backgroundShift: controls.backgroundShift.checked,
      minimalCursor: controls.minimalCursor.checked,
      particleCount: Number(controls.particleCount.value)
    };
  }

  function renderConnectionEditor() {
    els.connectionEditor.replaceChildren();
    (config.connections || []).forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "connection-row";
      row.innerHTML = `
        <label>Platform<input type="text" data-key="label" value="${escapeHtml(item.label || "")}"></label>
        <label>Shown text<input type="text" data-key="value" value="${escapeHtml(item.value || "")}"></label>
        <label>Mode
          <select data-key="mode">
            <option value="link" ${item.mode === "link" ? "selected" : ""}>Open link</option>
            <option value="copy" ${item.mode === "copy" ? "selected" : ""}>Copy text</option>
          </select>
        </label>
        <label>Target URL or copied text<input type="text" data-key="target" value="${escapeHtml(item.target || "")}"></label>
        <div class="row-actions">
          <button class="mini-button" type="button" data-action="up">Move up</button>
          <button class="mini-button" type="button" data-action="down">Move down</button>
          <button class="mini-button" type="button" data-action="remove">Remove</button>
        </div>
      `;
      row.querySelectorAll("input,select").forEach(input => {
        const eventName = input.tagName === "SELECT" ? "change" : "input";
        input.addEventListener(eventName, () => {
          config.connections[index][input.dataset.key] = input.value;
          renderConnections();
        });
      });
      row.querySelector('[data-action="up"]').addEventListener("click", () => moveConnection(index, -1));
      row.querySelector('[data-action="down"]').addEventListener("click", () => moveConnection(index, 1));
      row.querySelector('[data-action="remove"]').addEventListener("click", () => {
        config.connections.splice(index, 1);
        renderConnectionEditor();
        renderConnections();
      });
      els.connectionEditor.appendChild(row);
    });
  }

  function moveConnection(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= config.connections.length) return;
    [config.connections[index], config.connections[target]] = [config.connections[target], config.connections[index]];
    renderConnectionEditor();
    renderConnections();
  }

  function updateValueLabels() {
    valueLabels.overlay.textContent = String(Number(controls.overlay.value).toFixed(2));
    valueLabels.cardOpacity.textContent = String(Number(controls.cardOpacity.value).toFixed(2));
    valueLabels.blur.textContent = `${controls.blur.value}px`;
    valueLabels.width.textContent = `${controls.width.value}px`;
    valueLabels.radius.textContent = `${controls.radius.value}px`;
    valueLabels.particleCount.textContent = controls.particleCount.value;
    valueLabels.nameSize.textContent = `${controls.nameSize.value}px`;
    valueLabels.nameSpacing.textContent = `${controls.nameSpacing.value}px`;
    valueLabels.nameSpeed.textContent = `${controls.nameSpeed.value}s`;
  }

  function liveUpdate() {
    pullPanelIntoConfig();
    applyConfig();
  }

  function openAdmin() {
    fillPanel();
    els.panel.classList.add("open");
    els.panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-open");
    showToast("Secret panel unlocked");
  }

  function closeAdmin() {
    els.panel.classList.remove("open");
    els.panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("admin-open");
    els.saveMessage.textContent = "";
  }

  function showToast(text) {
    clearTimeout(toastTimer);
    els.toast.textContent = text;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function exportConfigFile() {
    pullPanelIntoConfig();
    const body = `/* Generated by the hidden profile control panel */\nwindow.SITE_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
    const blob = new Blob([body], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-config.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    els.saveMessage.textContent = "Downloaded site-config.js — replace the old one in GitHub.";
  }

  function armSecret() {
    secretArmed = true;
    secretBuffer = "";
    clearTimeout(armTimeout);
    armTimeout = setTimeout(() => { secretArmed = false; secretBuffer = ""; }, 12000);
    showToast("Panel armed · type AHMED");
  }

  function handleNameClick() {
    const now = Date.now();
    nameClicks.push(now);
    nameClicks = nameClicks.filter(time => now - time < 1400);
    if (nameClicks.length >= 3) {
      nameClicks = [];
      armSecret();
    }
  }

  function secretKeyListener(event) {
    if (!secretArmed) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
    secretBuffer = (secretBuffer + event.key.toLowerCase()).slice(-5);
    if (secretBuffer === "ahmed") {
      secretArmed = false;
      clearTimeout(armTimeout);
      secretBuffer = "";
      openAdmin();
    }
  }

  function updateSpotifyState(data) {
    if (!data) return;
    spotifyState = {
      isPaused: !!data.isPaused,
      duration: Number(data.duration || spotifyState.duration || 199000),
      position: Number(data.position || 0)
    };
    const pct = spotifyState.duration ? (spotifyState.position / spotifyState.duration) * 100 : 0;
    els.progress.value = String(Math.max(0, Math.min(100, pct)));
    els.current.textContent = formatTime(spotifyState.position / 1000);
    els.duration.textContent = formatTime(spotifyState.duration / 1000);
    document.body.classList.toggle("spotify-playing", !spotifyState.isPaused);
  }

  function animateSpotifyBars() {
    const t = (spotifyState.position || 0) / 1000;
    const playing = !spotifyState.isPaused;
    els.bars.forEach((bar, index) => {
      const wave = Math.abs(Math.sin(t * (1.35 + index * .08) + index * .72));
      const pulse = Math.abs(Math.sin(t * .48 + index * .37));
      const height = playing ? 18 + (wave * .68 + pulse * .32) * 82 : 20 + (index % 3) * 8;
      bar.style.height = `${height}%`;
    });
    const level = playing ? (.18 + Math.abs(Math.sin(t * .9)) * .32) : 0;
    document.documentElement.style.setProperty("--audio-level", level.toFixed(3));
    requestAnimationFrame(animateSpotifyBars);
  }

  function startSpotifyIfAllowed() {
    if (!spotifyController || config.media?.autoplayMusic === false) return;
    try { spotifyController.play(); } catch {}
  }

  function enableSpotifyOnFirstInteraction() {
    const once = () => {
      startSpotifyIfAllowed();
      window.removeEventListener("pointerdown", once);
      window.removeEventListener("keydown", once);
    };
    window.addEventListener("pointerdown", once, { once: true });
    window.addEventListener("keydown", once, { once: true });
  }

  window.onSpotifyIframeApiReady = IFrameAPI => {
    if (!els.spotifyEmbed) return;
    const options = {
      width: "100%",
      height: 80,
      url: config.media?.spotifyUrl || "https://open.spotify.com/track/2HgvorjycrfcCHEhVCCErk"
    };
    IFrameAPI.createController(els.spotifyEmbed, options, controller => {
      spotifyController = controller;
      controller.addListener("ready", () => {
        spotifyReady = true;
        startSpotifyIfAllowed();
      });
      controller.addListener("playback_update", event => updateSpotifyState(event.data));
      controller.addListener("playback_started", () => document.body.classList.add("spotify-playing"));
    });
  };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    els.particles.width = Math.floor(innerWidth * dpr);
    els.particles.height = Math.floor(innerHeight * dpr);
    els.particles.style.width = `${innerWidth}px`;
    els.particles.style.height = `${innerHeight}px`;
    els.particles.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Number(config.effects?.particleCount || 0);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.05 + .25,
      vx: (Math.random() - .5) * .08,
      vy: -(Math.random() * .12 + .02),
      a: Math.random() * .34 + .08
    }));
  }

  function animateParticles() {
    const ctx = els.particles.getContext("2d");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (config.effects?.particles) {
      const rgb = rgbFromHex(config.style?.accent || "#dcecff");
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random() * innerWidth; }
        if (p.x < -5) p.x = innerWidth + 5;
        if (p.x > innerWidth + 5) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
        ctx.fill();
      });
    }
    animationId = requestAnimationFrame(animateParticles);
  }

  function bindTilt() {
    els.card.addEventListener("mousemove", event => {
      if (!config.effects?.cardTilt || innerWidth < 700) return;
      const r = els.card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      els.card.style.transform = `perspective(1100px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-1px)`;
    });
    els.card.addEventListener("mouseleave", () => { els.card.style.transform = ""; });
  }

  function bindTabs() {
    els.tabs.forEach(tab => tab.addEventListener("click", () => {
      els.tabs.forEach(t => t.classList.toggle("active", t === tab));
      els.sections.forEach(section => section.classList.toggle("active", section.dataset.section === tab.dataset.tab));
    }));
  }

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    config.style = deepMerge(config.style || {}, preset.style || {});
    config.nameStyle = deepMerge(config.nameStyle || {}, preset.nameStyle || {});
    config.effects = deepMerge(config.effects || {}, preset.effects || {});
    applyConfig();
    fillPanel();
    showToast(`${name[0].toUpperCase()}${name.slice(1)} preset applied`);
  }

  function updateParallax(clientX, clientY) {
    if (!config.effects?.backgroundShift) {
      els.video.style.transform = "";
      els.fallback.style.transform = "";
      return;
    }
    const x = (clientX / innerWidth - .5) * 10;
    const y = (clientY / innerHeight - .5) * 10;
    const transform = `translate3d(${x}px, ${y}px, 0) scale(1.03)`;
    els.video.style.transform = transform;
    els.fallback.style.transform = transform;
  }

  function bindEvents() {
    window.addEventListener("load", () => setTimeout(() => { els.loader.classList.add("hidden"); document.body.classList.add("ready"); }, 170));
    document.addEventListener("keydown", secretKeyListener);
    els.name.addEventListener("click", handleNameClick);
    els.closePanel.addEventListener("click", closeAdmin);
    els.closeHitbox.addEventListener("click", closeAdmin);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && els.panel.classList.contains("open")) closeAdmin(); });
    bindTabs();

    els.presetButtons.forEach(button => button.addEventListener("click", () => applyPreset(button.dataset.preset)));

    els.addConnection.addEventListener("click", () => {
      config.connections = config.connections || [];
      config.connections.push({ label: "Platform", value: "username", mode: "link", target: "https://" });
      renderConnectionEditor();
      renderConnections();
    });

    const instantControls = Object.values(controls).filter(Boolean);
    instantControls.forEach(control => {
      const eventName = control.type === "checkbox" || control.tagName === "SELECT" || control.type === "color" ? "change" : "input";
      control.addEventListener(eventName, liveUpdate);
      if (control.id === "admin-avatar" || control.id === "admin-decoration" || control.id === "admin-spotify-url" || control.id === "admin-video" || control.id === "admin-album-art") {
        control.addEventListener("change", liveUpdate);
      }
    });

    els.saveLocal.addEventListener("click", () => {
      pullPanelIntoConfig();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      els.saveMessage.textContent = "Saved in this browser.";
      showToast("Saved locally");
    });
    els.exportConfig.addEventListener("click", exportConfigFile);
    els.resetLocal.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      config = clone(DEFAULT_CONFIG);
      applyConfig();
      fillPanel();
      els.saveMessage.textContent = "Local overrides cleared.";
      showToast("Returned to public config");
    });

    els.progress.addEventListener("change", () => {
      if (!spotifyController || !spotifyState.duration) return;
      const seconds = Math.round((Number(els.progress.value) / 100) * spotifyState.duration / 1000);
      try { spotifyController.seek(seconds); } catch {}
    });

    els.avatar.addEventListener("error", () => els.avatar.classList.add("is-missing"));
    els.avatarDecoration.addEventListener("error", () => els.avatarDecoration.classList.add("is-missing"));
    els.video.addEventListener("error", () => els.video.classList.add("is-missing"));
    els.albumArt.addEventListener("error", () => { els.albumArt.src = config.profile?.avatar || "assets/avatar.jpg"; });

    window.addEventListener("mousemove", e => {
      els.glow.style.left = `${e.clientX}px`;
      els.glow.style.top = `${e.clientY}px`;
      els.cursor.style.left = `${e.clientX}px`;
      els.cursor.style.top = `${e.clientY}px`;
      updateParallax(e.clientX, e.clientY);
    }, { passive: true });

    document.querySelectorAll("a,button").forEach(node => {
      node.addEventListener("mouseenter", () => { els.cursor.style.width = "12px"; els.cursor.style.height = "12px"; });
      node.addEventListener("mouseleave", () => { els.cursor.style.width = "8px"; els.cursor.style.height = "8px"; });
    });

    window.addEventListener("resize", resizeCanvas, { passive: true });
    bindTilt();
    enableAudioOnFirstInteraction();
  }

  applyConfig();
  fillPanel();
  bindEvents();
  resizeCanvas();
  if (animationId) cancelAnimationFrame(animationId);
  animateParticles();
  animateSpotifyBars();
  enableSpotifyOnFirstInteraction();
})();
