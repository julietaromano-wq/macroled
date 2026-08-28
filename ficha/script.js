(function () {
  "use strict";

  /* Salvavidas por si este mismo archivo queda incluido dos veces en la
     página (dos <script src> apuntando al mismo bundle). Esto NO soluciona
     el caso de tener el script VIEJO todavía pegado en otro lado — para eso
     hay que sacarlo a mano de Webflow (Page Settings / Embeds). */
  if (window.__mlFichaScriptLoaded) return;
  window.__mlFichaScriptLoaded = true;

  /* —— Gallery —— */
  let GALLERY = [];
  let activeIndex = 0;
  const thumbsEl = document.getElementById("thumbs");
  const stageWrap = document.getElementById("stageWrap");
  const stageEl = document.getElementById("stage");
  const stageImg = document.getElementById("stageImg");
  const stageVideo = document.getElementById("stageVideo");
  const stagePlay = document.getElementById("stagePlay");
  const zoomLens = document.getElementById("zoomLens");
  const zoomPane = document.getElementById("zoomPane");
  const openLightboxBtn = document.getElementById("openLightboxBtn");
  const canHoverZoom = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const THUMB_PLAY = `<span class="thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>`;

  /* Portada de video por línea (fallback si no hay data-video-poster) */
  const LINE_VIDEO_POSTERS = {
    ECO: "eco_line-portada.png",
    POWER: "power_line-portada.png",
    PRO: "pro_line-portada.png",
    "PRO COMPACT": "pro_line-portada.png",
    UNI: "uni_line-portada.png",
  };
  const LINE_POSTER_BASE = "https://s3.coresagroup.com/MACROLED/WEB/luces-auto/";

  function normalizeLinea(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function posterFromLinea(linea) {
    const key = normalizeLinea(linea);
    if (!key) return "";
    const file = LINE_VIDEO_POSTERS[key] || LINE_VIDEO_POSTERS[key.replace(/_/g, " ")];
    return file ? LINE_POSTER_BASE + file : "";
  }

  function lineaFromVideoUrl(url) {
    const u = String(url || "");
    const file = (u.split("/").pop() || "").replace(/\.[a-z0-9]+$/i, "");
    const fromFile = normalizeLinea(file.replace(/[_-]+/g, " "));
    if (LINE_VIDEO_POSTERS[fromFile]) return fromFile;
    if (LINE_VIDEO_POSTERS[fromFile.split(" ")[0]]) return fromFile.split(" ")[0];
    const parts = u.split("/").map(normalizeLinea);
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      if (LINE_VIDEO_POSTERS[parts[i]]) return parts[i];
    }
    return "";
  }

  function resolveVideoPoster(el, videos, imageFallback) {
    const explicit = (el.getAttribute("data-video-poster") || "").trim();
    if (explicit) return explicit;
    const fromLine = posterFromLinea(
      el.getAttribute("data-linea") || el.getAttribute("data-line") || ""
    );
    if (fromLine) return fromLine;
    for (const v of videos || []) {
      const inferred = posterFromLinea(lineaFromVideoUrl(v));
      if (inferred) return inferred;
    }
    return (imageFallback || "").trim();
  }

  const FANCY_OPTS = {
    Images: { zoom: true, wheel: "zoom" },
    Toolbar: {
      display: {
        left: ["infobar"],
        middle: [],
        right: ["zoomIn", "zoomOut", "slideshow", "thumbs", "close"],
      },
    },
  };

  function youtubeId(url) {
    const m = String(url || "").match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i
    );
    return m ? m[1] : null;
  }

  function detectMediaType(url) {
    const u = String(url || "").trim();
    if (!u) return "image";
    if (youtubeId(u) || /youtube\.com|youtu\.be/i.test(u)) return "youtube";
    if (/vimeo\.com/i.test(u)) return "vimeo";
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(u)) return "html5video";
    return "image";
  }

  function isVideoType(type) {
    return type === "html5video" || type === "youtube" || type === "vimeo";
  }

  function mediaThumb(url, type, poster) {
    if (type === "youtube") {
      const id = youtubeId(url);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (isVideoType(type)) return poster || "";
    return url;
  }

  function urlsToGallery(urls, altBase, poster) {
    const seen = new Set();
    let imageCount = 0;
    let videoCount = 0;
    return (urls || [])
      .map((u) => String(u || "").trim())
      .filter((u) => {
        if (!u || u.length < 5) return false;
        const type = detectMediaType(u);
        if (type === "image" && /\/(250|1000)\//.test(u)) return false;
        if (seen.has(u)) return false;
        seen.add(u);
        return true;
      })
      .map((url) => {
        const type = detectMediaType(url);
        const isVideo = isVideoType(type);
        if (isVideo) videoCount += 1;
        else imageCount += 1;
        const n = isVideo ? videoCount : imageCount;
        const label = isVideo ? `video ${n}` : `vista ${n}`;
        const thumb = mediaThumb(url, type, poster);
        return {
          type,
          alt: altBase ? `${altBase} — ${label}` : label,
          thumb,
          display: url,
          full: url,
          poster: poster || (type === "youtube" ? thumb : "") || "",
        };
      });
  }

  function stopStageVideo() {
    if (!stageVideo) return;
    try {
      stageVideo.pause();
      stageVideo.removeAttribute("src");
      stageVideo.load();
    } catch (_) {}
    stageVideo.hidden = true;
  }

  function renderThumbs() {
    if (!thumbsEl) return;
    thumbsEl.hidden = GALLERY.length <= 1;
    thumbsEl.innerHTML = GALLERY.map((g, i) => {
      const videoClass = isVideoType(g.type) ? " is-video" : "";
      const activeClass = i === activeIndex ? " is-active" : "";
      const img = g.thumb
        ? `<img src="${g.thumb}" alt="" loading="lazy">`
        : `<span class="thumb-fallback" aria-hidden="true"></span>`;
      return `<button type="button" class="thumb${activeClass}${videoClass}" role="option" data-index="${i}" aria-label="${g.alt}" aria-selected="${i === activeIndex}">
        ${img}${isVideoType(g.type) ? THUMB_PLAY : ""}
      </button>`;
    }).join("");
  }

  function syncZoomBg() {
    const g = GALLERY[activeIndex];
    if (!g || !zoomPane || isVideoType(g.type)) {
      if (zoomPane) zoomPane.style.backgroundImage = "";
      return;
    }
    zoomPane.style.backgroundImage = `url("${g.full}")`;
  }

  function setActive(i) {
    if (!GALLERY.length || !stageImg) return;
    activeIndex = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[activeIndex];
    const video = isVideoType(g.type);
    stopZoom();
    stopStageVideo();

    stageEl.classList.toggle("is-video", video);
    if (openLightboxBtn) {
      const mobileShare = window.matchMedia("(max-width: 640px)").matches;
      openLightboxBtn.setAttribute(
        "aria-label",
        mobileShare ? "Compartir" : video ? "Ampliar video" : "Ampliar imagen"
      );
    }

    if (g.type === "html5video" && stageVideo) {
      stageImg.hidden = true;
      stageVideo.hidden = false;
      if (stagePlay) stagePlay.hidden = true;
      stageVideo.poster = g.poster || g.thumb || "";
      stageVideo.src = g.display;
      stageVideo.load();
    } else {
      if (stageVideo) stageVideo.hidden = true;
      stageImg.hidden = false;
      stageImg.src = video ? g.thumb || g.poster || g.display : g.display;
      stageImg.alt = g.alt;
      if (stagePlay) stagePlay.hidden = !(video && (g.type === "youtube" || g.type === "vimeo"));
    }

    syncZoomBg();
    renderThumbs();
  }

  function setGallery(urls, altBase, opts) {
    opts = opts || {};
    GALLERY = urlsToGallery(urls, altBase, opts.poster || "");
    if (!GALLERY.length) {
      const fallback = document.querySelector(".cms-product-item")?.getAttribute("data-image");
      if (fallback) GALLERY = urlsToGallery([fallback], altBase, opts.poster || "");
    }
    activeIndex = 0;
    setActive(0);
    const aiImg = document.getElementById("aiProductImg");
    if (aiImg && GALLERY[0]) aiImg.src = GALLERY[0].thumb || GALLERY[0].display;
  }

  function fancyItem(g) {
    if (g.type === "html5video") {
      return {
        src: g.full,
        type: "html5video",
        caption: g.alt,
        preload: false,
        thumb: g.thumb || g.poster || undefined,
        poster: g.poster || g.thumb || undefined,
      };
    }
    if (g.type === "youtube") {
      return { src: g.full, type: "youtube", caption: g.alt, thumb: g.thumb || undefined };
    }
    if (g.type === "vimeo") {
      return { src: g.full, type: "vimeo", caption: g.alt, thumb: g.thumb || undefined };
    }
    /* Sin type forzado: Fancybox detecta la imagen por la URL */
    return { src: g.full, caption: g.alt };
  }

  function openFancy(index) {
    if (!GALLERY.length || typeof Fancybox === "undefined") return;
    const startIndex = Math.max(0, Math.min(index || 0, GALLERY.length - 1));
    try {
      Fancybox.show(GALLERY.map(fancyItem), { ...FANCY_OPTS, startIndex });
    } catch (err) {
      console.warn("[lightbox]", err);
      try {
        Fancybox.show(
          GALLERY.filter((g) => !isVideoType(g.type)).map((g) => ({ src: g.full, caption: g.alt })),
          { ...FANCY_OPTS, startIndex: 0 }
        );
      } catch (err2) {
        console.warn("[lightbox:fallback]", err2);
      }
    }
  }

  function stopZoom() {
    stageWrap.classList.remove("is-zooming");
  }

  function activeIsImage() {
    return GALLERY[activeIndex] && !isVideoType(GALLERY[activeIndex].type);
  }

  function updateZoom(e) {
    if (!canHoverZoom || !activeIsImage()) return;
    const rect = stageEl.getBoundingClientRect();
    const viewportMargin = 24;
    const spaceRight = window.innerWidth - rect.right - 14 - viewportMargin;
    const preferredPane = Math.min(440, window.innerWidth * 0.46);
    const fitsBeside = spaceRight >= 260;

    zoomPane.classList.toggle("is-below", !fitsBeside);

    let paneW, paneH;
    if (fitsBeside) {
      paneW = Math.max(260, Math.min(preferredPane, spaceRight));
      zoomPane.style.width = `${paneW}px`;
      zoomPane.style.removeProperty("top");
      paneH = zoomPane.offsetHeight || paneW;
    } else {
      zoomPane.style.width = "";
      paneW = zoomPane.offsetWidth || rect.width;
      paneH = zoomPane.offsetHeight || paneW * 0.625;
    }

    const zoomFactor = 2.35;
    const lensW = Math.min(rect.width * 0.55, Math.max(100, paneW / zoomFactor));
    const lensH = Math.min(rect.height * 0.55, Math.max(100, paneH / zoomFactor));
    zoomLens.style.width = `${lensW}px`;
    zoomLens.style.height = `${lensH}px`;

    let x = e.clientX - rect.left - lensW / 2;
    let y = e.clientY - rect.top - lensH / 2;
    x = Math.max(0, Math.min(x, rect.width - lensW));
    y = Math.max(0, Math.min(y, rect.height - lensH));
    zoomLens.style.left = `${x}px`;
    zoomLens.style.top = `${y}px`;

    const bgW = (rect.width / lensW) * paneW;
    const bgH = (rect.height / lensH) * paneH;
    zoomPane.style.backgroundSize = `${bgW}px ${bgH}px`;
    zoomPane.style.backgroundPosition = `${-(x * (bgW / rect.width))}px ${-(y * (bgH / rect.height))}px`;
  }

  thumbsEl.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn || !canHoverZoom) return;
    const i = Number(btn.dataset.index);
    if (i !== activeIndex) setActive(i);
  });
  thumbsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    setActive(Number(btn.dataset.index));
  });

  if (canHoverZoom) {
    stageEl.addEventListener("mouseenter", (e) => {
      if (e.target.closest(".zoom-btn")) return;
      if (!activeIsImage()) return;
      syncZoomBg();
      stageWrap.classList.add("is-zooming");
      updateZoom(e);
    });
    stageEl.addEventListener("mousemove", (e) => {
      if (!stageWrap.classList.contains("is-zooming")) return;
      if (!activeIsImage() || e.target.closest(".zoom-btn")) {
        stopZoom();
        return;
      }
      updateZoom(e);
    });
    stageEl.addEventListener("mouseleave", stopZoom);
  }

  function onOpenGallery(e) {
    e.preventDefault();
    e.stopPropagation();
    stopZoom();
    openFancy(activeIndex);
  }

  /* Swipe horizontal sobre la imagen principal (mobile/touch): cambia de
     foto sin abrir el visor. Un tap simple (sin arrastre) sigue abriendo
     el visor vía el click handler de más abajo. La imagen sigue al dedo
     mientras se arrastra, para que se note que "hay más fotos" del lado
     al que se está deslizando. */
  const STAGE_SWIPE_THRESHOLD = 40;
  const STAGE_SLIDE_MS = 150;
  let stageSwipeStartX = 0;
  let stageSwipeDx = 0;
  let stageSwipeDragging = false;
  let stageSwipeSettling = false;
  let stageJustSwiped = false;

  function setStageDrag(px, animate) {
    stageImg.style.transition = animate
      ? `transform ${STAGE_SLIDE_MS}ms cubic-bezier(.22,.8,.32,1)`
      : "none";
    stageImg.style.transform = px ? `translateX(${px}px)` : "";
  }

  stageEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch" || e.target.closest(".zoom-btn") || stageSwipeSettling) return;
    stageSwipeStartX = e.clientX;
    stageSwipeDx = 0;
    stageSwipeDragging = false;
  });
  stageEl.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "touch" || GALLERY.length < 2 || stageSwipeSettling) return;
    stageSwipeDx = e.clientX - stageSwipeStartX;
    if (!stageSwipeDragging && Math.abs(stageSwipeDx) > 10) stageSwipeDragging = true;
    if (stageSwipeDragging) setStageDrag(stageSwipeDx, false);
  });
  function finishStageSwipe(e) {
    if (e.pointerType !== "touch" || !stageSwipeDragging) return;
    stageSwipeDragging = false;
    const stageWidth = stageEl.clientWidth || 1;
    if (Math.abs(stageSwipeDx) >= STAGE_SWIPE_THRESHOLD && GALLERY.length > 1) {
      stageJustSwiped = true;
      stageSwipeSettling = true;
      const dir = stageSwipeDx < 0 ? 1 : -1; // swipe a la izquierda -> foto siguiente
      setStageDrag(-dir * stageWidth, true);
      window.setTimeout(() => {
        setActive(activeIndex + dir);
        setStageDrag(dir * stageWidth, false);
        void stageImg.offsetWidth; // fuerza reflow antes de animar la entrada
        setStageDrag(0, true);
        window.setTimeout(() => {
          stageSwipeSettling = false;
        }, STAGE_SLIDE_MS);
      }, STAGE_SLIDE_MS);
    } else {
      setStageDrag(0, true);
    }
  }
  stageEl.addEventListener("pointerup", finishStageSwipe);
  stageEl.addEventListener("pointercancel", () => {
    if (stageSwipeDragging) setStageDrag(0, true);
    stageSwipeDragging = false;
  });

  stageEl.addEventListener("click", (e) => {
    if (stageJustSwiped) {
      stageJustSwiped = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.target.closest(".zoom-btn")) return;
    // Controles nativos del video visible: no abrir lightbox
    if (e.target.closest("video") && stageVideo && !stageVideo.hidden) return;
    onOpenGallery(e);
  });
  const mqShareInStage = window.matchMedia("(max-width: 640px)");
  function syncStageCornerLabel() {
    if (!openLightboxBtn || !GALLERY.length) return;
    const g = GALLERY[activeIndex];
    const video = g && isVideoType(g.type);
    openLightboxBtn.setAttribute(
      "aria-label",
      mqShareInStage.matches ? "Compartir" : video ? "Ampliar video" : "Ampliar imagen"
    );
  }
  mqShareInStage.addEventListener?.("change", syncStageCornerLabel);

  if (openLightboxBtn) {
    openLightboxBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (mqShareInStage.matches) {
        /* En mobile el botón abre compartir; el tap en la imagen sigue ampliando */
        if (typeof window.__mlToggleShareFromStage === "function") {
          window.__mlToggleShareFromStage(openLightboxBtn);
        }
        return;
      }
      onOpenGallery(e);
    });
  }

  window.MacroledFicha = { setGallery, setActive, getGallery: () => GALLERY };

  /* —— Tabs —— */
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      // Genérico: cualquier .tab-panel cuyo id sea "panel-<data-tab>" se sincroniza.
      // Así los tabs nuevos (armados/despiece, etc.) no requieren tocar este archivo.
      document.querySelectorAll(".tab-panel[id^='panel-']").forEach((panel) => {
        const key = panel.id.slice("panel-".length);
        const on = key === tab.dataset.tab;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
      requestAnimationFrame(syncAccordionHeights);
    });
  });

  /* —— Spec schema + tooltips + hide empty —— */
  const ICON_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
  const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const ICON_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>';
  const ICON_WIFI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5a9.5 9.5 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none"/></svg>';
  const ICON_REMOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6"/></svg>';

  const SPEC_GROUPS = [
    {
      title: "Características eléctricas",
      icon: ICON_BOLT,
      rows: [
        { key: "Tensión", tip: "Voltaje de alimentación del producto (AC o DC)." },
        { key: "Tensión nominal", tip: "Voltaje nominal de trabajo del producto (por ejemplo 12 V)." },
        { key: "Rango de tensión", tip: "Rango de voltaje de entrada aceptado por el producto (mínimo / máximo)." },
        { key: "Entrada", tip: "Datos de alimentación de entrada: tensión, frecuencia y corriente." },
        { key: "Tipo de energía", tip: "Fuente de energía con la que opera (red, batería, USB, etc.)." },
        { key: "Frecuencia", tip: "Frecuencia de la red eléctrica, en hertz (Hz)." },
        { key: "Corriente", tip: "Corriente eléctrica que consume o entrega el producto." },
        { key: "Corriente entrada", tip: "Corriente de entrada nominal del equipo." },
        { key: "Corriente de entrada Iin (A)", tip: "Corriente de entrada (Iin) que consume el producto, en amperios (A)." },
        { key: "Corriente de salida Iout (A)", tip: "Corriente de salida (Iout) entregada a la lámpara, en amperios (A)." },
        { key: "Potencia", tip: "Consumo eléctrico, en vatios (W)." },
        { key: "Potencia nominal por lámpara", tip: "Potencia nominal declarada por cada lámpara, en vatios (W)." },
        { key: "Potencia de entrada por lámpara", tip: "Potencia de entrada consumida por cada lámpara (puede variar entre altas y bajas)." },
        { key: "Potencia estable por lámpara", tip: "Potencia de trabajo estable por lámpara en régimen continuo (altas / bajas)." },
        { key: "Driver", tip: "Tipo de driver o fuente que alimenta el LED (integrado, externo, etc.)." },
        { key: "Tipo de driver", tip: "Tipo de fuente/driver que alimenta el LED." },
        { key: "CANBUS", tip: "Compatibilidad con sistema CANBUS del vehículo (evita errores de lámpara fundida)." },
        { key: "Compatible con sensor", tip: "Indica si admite sensores externos (movimiento, luz, etc.)." },
        { key: "Sensor incluido", tip: "Si el producto trae sensor de fábrica." },
        { key: "Factor de Potencia (FP)", tip: "Qué tan eficiente es el uso de la energía. Más cerca de 1 es mejor." },
        { key: "THD", tip: "Distorsión armónica de la corriente. Cuanto más bajo, mejor calidad eléctrica." },
        { key: "Dimerizable", tip: "Si permite regular la intensidad de la luz." },
        { key: "Canales", tip: "Cantidad de canales de control o salida." },
        { key: "Indicador luminoso", tip: "Señalización LED de estado en el equipo." },
        { key: "Tomacorriente", tip: "Si incluye toma de corriente integrada." },
        { key: "Conector USB", tip: "Puerto USB disponible (carga o datos)." },
        { key: "Capacitor", tip: "Capacidad del capacitor integrado, cuando aplica." },
        { key: "EMC", tip: "Cumplimiento de compatibilidad electromagnética." },
        { key: "SDCM", tip: "Uniformidad de color entre unidades. Más bajo es más consistente." },
        { key: "Anti-High-Volt", tip: "Protección contra picos de tensión en la red eléctrica." },
        { key: "ON-OFF Switch", tip: "Interruptor de encendido/apagado o ciclos On-Off soportados." },
        { key: "Protector SPD", tip: "Protección contra sobretensiones (Surge Protection Device)." },
        { key: "SPD", tip: "Protección contra sobretensiones (Surge Protection Device)." },
        { key: "No Flicker - sin parpadeo", tip: "Diseño sin parpadeo perceptible (flicker-free)." },
        { key: "Corriente de Irrupción (Inrush)", tip: "Pico de corriente al encender el equipo." },
        { key: "Tiempo de irrupción Th50", tip: "Duración del pico de irrupción hasta el 50%." },
        { key: "Clase de protección", tip: "Clase de aislamiento eléctrico (I, II, III)." },
        { key: "Clase eléctrica", tip: "Clase de aislamiento eléctrico del producto (I, II o III)." },
        { key: "Max. n° de lum. freno de circuito B16 A", tip: "Máximo de luminarias por breaker tipo B 16 A." },
        { key: "Max. n° de lum. freno de circuito C10 A", tip: "Máximo de luminarias por breaker tipo C 10 A." },
        { key: "Max. n° de lum. freno de circuito C16 A", tip: "Máximo de luminarias por breaker tipo C 16 A." },
        { key: "Tipo de carga", tip: "Método de carga de la batería (USB-C, magnética, etc.)." },
        { key: "Tiempo de carga", tip: "Tiempo aproximado para cargar la batería al completo." },
        { key: "Autonomía", tip: "Tiempo de uso con batería, según intensidad." },
        { key: "Temperatura de trabajo", tip: "Rango de temperatura ambiente de operación del producto." },
      ],
    },
    {
      title: "Características lumínicas",
      icon: ICON_SUN,
      rows: [
        { key: "Lúmenes/W", tip: "Eficiencia lumínica: lúmenes por cada vatio consumido." },
        { key: "Flujo luminoso", tip: "Cantidad total de luz emitida, en lúmenes (lm)." },
        { key: "Flujo luminoso nominal total", tip: "Flujo luminoso nominal total del producto, en lúmenes (lm)." },
        { key: "Flujo luminoso inicial total", tip: "Flujo luminoso al encender (inicial), total del sistema. Puede variar entre altas y bajas." },
        { key: "Flujo luminoso estable total", tip: "Flujo luminoso en régimen estable, total del sistema, en lúmenes (lm)." },
        { key: "Temperatura del color", tip: "Tono de la luz en Kelvin: más bajo es más cálida, más alto es más fría." },
        { key: "Tipo de luz", tip: "Clasificación del tono (cálido, neutro, frío) o modo de luz." },
        { key: "Tipo de blanco", tip: "Tipo de blanco de la luz (cálido, neutro o frío)." },
        { key: "Ángulo de apertura", tip: "Ángulo en el que se distribuye la luz." },
        { key: "CRI", tip: "Fidelidad de color bajo esta luz, en una escala de 0 a 100." },
        { key: "Tipo de LED", tip: "Tecnología o encapsulado del LED utilizado." },
        { key: "Tipo de chip LED", tip: "Modelo o referencia del chip LED utilizado en el producto." },
        { key: "Tiempo de arranque", tip: "Tiempo hasta alcanzar el flujo luminoso nominal." },
        { key: "Vida útil", tip: "Vida estimada del LED en horas de uso." },
        { key: "UGR", tip: "Nivel de deslumbramiento molesto que puede causar la luminaria." },
        { key: "LM80", tip: "Ensayo que certifica cuánto se deprecia la luz del LED con el tiempo." },
        { key: "Desviación estándar de igualación de colores", tip: "Consistencia de color entre unidades (relacionado con SDCM)." },
        { key: "Desviación estándar", tip: "Consistencia de color entre unidades (relacionado con SDCM)." },
        { key: "Grupo de seguridad fotobiológica acc. EN62778", tip: "Clasificación de riesgo fotobiológico según normativa EN62778." },
        { key: "EN62778", tip: "Cumplimiento de seguridad fotobiológica según norma EN62778." },
      ],
    },
    {
      title: "Características materiales",
      icon: ICON_BOX,
      rows: [
        { key: "Dimensiones", tip: "Medidas exteriores del producto." },
        { key: "Tamaño", tip: "Dimensiones o formato general del producto." },
        { key: "Peso", tip: "Peso neto del producto." },
        { key: "Material del cuerpo", tip: "Material principal de la carcasa o estructura." },
        { key: "Material de tapa", tip: "Material de la tapa o cubierta." },
        { key: "Material del lente", tip: "Material del difusor u óptica." },
        { key: "Conector", tip: "Tipo de conector eléctrico o de instalación." },
        { key: "Conexión", tip: "Tipo de conexión del accesorio o luminaria." },
        { key: "Compatibilidad", tip: "Líneas o productos con los que es compatible." },
        { key: "Color del cuerpo", tip: "Color de la carcasa / cuerpo del producto." },
        { key: "Color de carcasa", tip: "Color exterior de la carcasa." },
        { key: "Panel táctil", tip: "Indica si el producto incluye panel táctil de control." },
        { key: "Largo del cable", tip: "Longitud del cable incluido." },
        { key: "Dimensiones del cable", tip: "Sección o medidas del cable incluido." },
        { key: "Tipo de cable", tip: "Tipo o especificación del cable incluido." },
        { key: "Largo del rollo", tip: "Longitud total del rollo de tira." },
        { key: "Distancia corte", tip: "Distancia entre puntos de corte de la tira." },
        { key: "Cantidad de luces", tip: "Cantidad de LEDs o puntos de luz." },
        { key: "Tipo de montaje", tip: "Forma de instalación (sobreponer, empotrar, pie, etc.)." },
        { key: "Tipo de instalación", tip: "Forma de instalación o montaje del producto." },
        { key: "Temperatura de operación", tip: "Rango de temperatura ambiente de uso." },
        { key: "Protección IP", tip: "Grado de protección contra polvo y agua." },
        { key: "Protección IK", tip: "Grado de protección contra impactos mecánicos." },
        { key: "Protección", tip: "Grados de protección del producto (IP / IK)." },
        { key: "Protección estanca", tip: "Nivel de estanqueidad / sellado frente a polvo y agua." },
        { key: "RPM del cooler", tip: "Velocidad de giro del ventilador de refrigeración, en revoluciones por minuto." },
        { key: "Cooler outer diameter", tip: "Diámetro exterior del cooler / ventilador." },
        { key: "Filamentos de cobre", tip: "Cantidad de filamentos o heatpipes de cobre del disipador." },
      ],
    },
    {
      title: "Características de conectividad",
      icon: ICON_WIFI,
      rows: [
        { key: "Modo de conectividad", tip: "Protocolo o medio de conexión (Wi‑Fi, RF, Bluetooth, etc.)." },
        { key: "Conectividad", tip: "Tipo de conectividad del producto." },
        { key: "Frecuencia de operación", tip: "Frecuencia de radio o red en la que opera." },
        { key: "Chip", tip: "Chipset de conectividad integrado." },
        { key: "Tipo de red", tip: "Tipo de red compatible (2.4 GHz, Zigbee, etc.)." },
        { key: "Sistemas operativos soportados", tip: "SO móviles o de escritorio compatibles con la app." },
        { key: "Distancia de alcance RF en exterior", tip: "Alcance de radiofrecuencia en exteriores." },
        { key: "Distancia de alcance RF en interior", tip: "Alcance de radiofrecuencia en interiores." },
        { key: "Compatible con asistentes", tip: "Asistentes de voz o ecosistemas compatibles." },
        { key: "Funciones", tip: "Funciones inteligentes o de control disponibles." },
        { key: "APP", tip: "Aplicación móvil asociada al producto." },
        { key: "Conductores", tip: "Cantidad o tipo de conductores del cable." },
      ],
    },
    {
      title: "Características eléctricas de la controladora",
      icon: ICON_BOLT,
      rows: [
        { key: "Tensión controladora", tip: "Tensión de alimentación de la controladora." },
        { key: "Potencia controladora", tip: "Potencia máxima de la controladora." },
        { key: "Corriente por canal", tip: "Corriente máxima entregada por cada canal." },
      ],
    },
    {
      title: "Características del control remoto",
      icon: ICON_REMOTE,
      rows: [
        { key: "Alimentación remoto", tip: "Tipo de batería o alimentación del control remoto." },
        { key: "Dimensiones remoto", tip: "Medidas del control remoto." },
        { key: "Cantidad de botones", tip: "Número de botones del control remoto." },
        { key: "Alcance", tip: "Distancia máxima de operación del control remoto." },
      ],
    },
    {
      title: "Características de la controladora",
      icon: ICON_BOX,
      rows: [
        { key: "Dimensiones controladora", tip: "Medidas de la controladora." },
        { key: "Material del cuerpo controladora", tip: "Material de la carcasa de la controladora." },
        { key: "Conector controladora", tip: "Tipo de conector de la controladora." },
        { key: "Color de carcasa controladora", tip: "Color exterior de la controladora." },
        { key: "Largo del cable controladora", tip: "Longitud del cable de la controladora." },
        { key: "Garantía controladora", tip: "Garantía específica de la controladora." },
        { key: "Temperatura de operación controladora", tip: "Rango térmico de uso de la controladora." },
        { key: "Protección IP controladora", tip: "Grado IP de la controladora." },
      ],
    },
  ];

  /* Aliases CMS / labels → key canónica del schema */
  const SPEC_KEY_ALIASES = {
    Tension: "Tensión",
    Tensión: "Tensión",
    "Tension nominal": "Tensión nominal",
    "Tensión nominal": "Tensión nominal",
    "TENSION NOMINAL": "Tensión nominal",
    "Rango de tension": "Rango de tensión",
    "Rango de tensión": "Rango de tensión",
    "RANGO DE TENSION": "Rango de tensión",
    "RANGO DE TENSIÓN": "Rango de tensión",
    "Potencia nominal por lampara": "Potencia nominal por lámpara",
    "Potencia nominal por lámpara": "Potencia nominal por lámpara",
    "POTENCIA NOMINAL POR LAMPARA": "Potencia nominal por lámpara",
    "POTENCIA NOMINAL POR LÁMPARA": "Potencia nominal por lámpara",
    "Potencia de entrada por lampara": "Potencia de entrada por lámpara",
    "Potencia de entrada por lámpara": "Potencia de entrada por lámpara",
    "POTENCIA DE ENTRADA POR LAMPARA": "Potencia de entrada por lámpara",
    "POTENCIA DE ENTRADA POR LÁMPARA": "Potencia de entrada por lámpara",
    "Potencia estable por lampara": "Potencia estable por lámpara",
    "Potencia estable por lámpara": "Potencia estable por lámpara",
    "POTENCIA ESTABLE POR LAMPARA": "Potencia estable por lámpara",
    "POTENCIA ESTABLE POR LÁMPARA": "Potencia estable por lámpara",
    "Corriente de entrada lin (A)": "Corriente de entrada Iin (A)",
    "Corriente de entrada Iin (A)": "Corriente de entrada Iin (A)",
    "Corriente de entrada Lin (A)": "Corriente de entrada Iin (A)",
    "CORRIENTE DE ENTRADA IIN (A)": "Corriente de entrada Iin (A)",
    "CORRIENTE DE ENTRADA LIN (A)": "Corriente de entrada Iin (A)",
    "Corriente de salida lout (A)": "Corriente de salida Iout (A)",
    "Corriente de salida Iout (A)": "Corriente de salida Iout (A)",
    "Corriente de salida Lout (A)": "Corriente de salida Iout (A)",
    "CORRIENTE DE SALIDA IOUT (A)": "Corriente de salida Iout (A)",
    "CORRIENTE DE SALIDA LOUT (A)": "Corriente de salida Iout (A)",
    "Tipo de chip LED": "Tipo de chip LED",
    "TIPO DE CHIP LED": "Tipo de chip LED",
    "Tipo de Chip LED": "Tipo de chip LED",
    "Flujo luminoso nominal total": "Flujo luminoso nominal total",
    "FLUJO LUMINOSO NOMINAL TOTAL": "Flujo luminoso nominal total",
    "Flujo luminoso inicial total": "Flujo luminoso inicial total",
    "FLUJO LUMINOSO INICIAL TOTAL": "Flujo luminoso inicial total",
    "Flujo luminoso estable total": "Flujo luminoso estable total",
    "FLUJO LUMINOSO ESTABLE TOTAL": "Flujo luminoso estable total",
    "Tipo de Energia": "Tipo de energía",
    "Tipo de Energía": "Tipo de energía",
    Dimeable: "Dimerizable",
    Dimerizable: "Dimerizable",
    "Lumenes Lm/w": "Lúmenes/W",
    "Lúmenes Lm/w": "Lúmenes/W",
    "Lm/W": "Lúmenes/W",
    "Flujo Luminoso": "Flujo luminoso",
    "Temperatura de color": "Temperatura del color",
    "Temperatura Color": "Temperatura del color",
    "Angulo de Apertura": "Ángulo de apertura",
    "Ángulo de Apertura": "Ángulo de apertura",
    "tipo de led": "Tipo de LED",
    "Tipo de led": "Tipo de LED",
    "Vida util": "Vida útil",
    "Certificado LM80": "LM80",
    LM80: "LM80",
    "Color de carcasa": "Color de carcasa",
    "Color del cuerpo": "Color del cuerpo",
    COLOR: "Color del cuerpo",
    Color: "Color del cuerpo",
    Material: "Material del cuerpo",
    "Material cuerpo": "Material del cuerpo",
    "MATERIAL CUERPO": "Material del cuerpo",
    Tamaño: "Tamaño",
    Dimensiones: "Dimensiones",
    DIMENSIONES: "Dimensiones",
    "Proteccion IP": "Protección IP",
    "Protección IP": "Protección IP",
    IP: "Protección IP",
    "Proteccion IK": "Protección IK",
    "Protección IK": "Protección IK",
    Garantia: "Garantía",
    Garantía: "Garantía",
    "GARANTIA TIEMPO": "Garantía",
    "Garantia tiempo": "Garantía",
    "Garantía tiempo": "Garantía",
    "Garantia Macroled": "Garantía Macroled",
    "Garantia de fabrica": "Garantía de fábrica",
    "Garantía de fabrica": "Garantía de fábrica",
    "Temperatura de operacion": "Temperatura de operación",
    "TEMPERATURA DE OPERACION": "Temperatura de operación",
    "TEMPERATURA COLOR": "Temperatura del color",
    "FLUJO LUMINOSO": "Flujo luminoso",
    "ANGULO DE APERTURA": "Ángulo de apertura",
    "LUMENES/W": "Lúmenes/W",
    FRECUENCIA: "Frecuencia",
    Frecuencia: "Frecuencia",
    AUTONOMÍA: "Autonomía",
    Autonomia: "Autonomía",
    CLASE: "Clase de protección",
    Clase: "Clase de protección",
    Cri: "CRI",
    CRI: "CRI",
    "PANEL TACTIL": "Panel táctil",
    "Panel tactil": "Panel táctil",
    "Panel táctil": "Panel táctil",
    "Control remoto": "Control remoto",
    "CONTROL REMOTO": "Control remoto",
    FUNCIONES: "Funciones",
    POTENCIA: "Potencia",
    TENSIÓN: "Tensión",
    "TIPO DE CARGA": "Tipo de carga",
    "Tipo de carga": "Tipo de carga",
    "TIEMPO DE CARGA": "Tiempo de carga",
    "Tiempo de carga": "Tiempo de carga",
    "TIPO DE LED": "Tipo de LED",
    "TIPO DE LUZ": "Tipo de luz",
    DIMERIZABLE: "Dimerizable",
    Smart: "Smart",
    Sdcm: "SDCM",
    SDCM: "SDCM",
    "Frecuencia de Operacion": "Frecuencia de operación",
    "Clase de proteccion": "Clase de protección",
    "Factor de Potencia (FP)": "Factor de Potencia (FP)",
    "Factor de potencia": "Factor de Potencia (FP)",
    "Anti high volt": "Anti-High-Volt",
    "Anti High Volt": "Anti-High-Volt",
    "Anti-high-volt": "Anti-High-Volt",
    "On-Off": "ON-OFF Switch",
    "On/Off Switch": "ON-OFF Switch",
    "ON / OFF switch": "ON-OFF Switch",
    Entrada: "Entrada",
    ENTRADA: "Entrada",
    Driver: "Driver",
    DRIVER: "Driver",
    CANBUS: "CANBUS",
    Canbus: "CANBUS",
    "Clase electrica": "Clase eléctrica",
    "Clase eléctrica": "Clase eléctrica",
    "Clase Eléctrica": "Clase eléctrica",
    "CLASE ELECTRICA": "Clase eléctrica",
    "Temperatura de Trabajo": "Temperatura de trabajo",
    "Temperatura de trabajo": "Temperatura de trabajo",
    "TEMPERATURA DE TRABAJO": "Temperatura de trabajo",
    SPD: "SPD",
    "Protector SPD": "Protector SPD",
    "Corriente Irrupción": "Corriente de Irrupción (Inrush)",
    "Corriente de irrupción": "Corriente de Irrupción (Inrush)",
    "Corriente de Irrupción": "Corriente de Irrupción (Inrush)",
    "Tipo de Blanco": "Tipo de blanco",
    "Tipo de blanco": "Tipo de blanco",
    "TIPO DE BLANCO": "Tipo de blanco",
    EN62778: "EN62778",
    "Desviacion estandar": "Desviación estándar",
    "Desviación estándar": "Desviación estándar",
    "Desviación Estándar": "Desviación estándar",
    "Color cuerpo": "Color del cuerpo",
    "Material del Lente": "Material del lente",
    "Material del lente": "Material del lente",
    "Tipo de instalacion": "Tipo de instalación",
    "Tipo de instalación": "Tipo de instalación",
    "TIPO DE INSTALACION": "Tipo de instalación",
    "Tipo de montaje": "Tipo de montaje",
    Proteccion: "Protección",
    Protección: "Protección",
    "Proteccion estanca": "Protección estanca",
    "Protección estanca": "Protección estanca",
    "PROTECCION ESTANCA": "Protección estanca",
    "Tipo de cable": "Tipo de cable",
    "TIPO DE CABLE": "Tipo de cable",
    "RPM del cooler": "RPM del cooler",
    "RPM DEL COOLER": "RPM del cooler",
    "Cooler outer diameter": "Cooler outer diameter",
    "Filamentos de cobre": "Filamentos de cobre",
    "FILAMENTOS DE COBRE": "Filamentos de cobre",
    UGR: "UGR",
    EMC: "EMC",
    THD: "THD",
  };

  /**
   * Atributos sueltos del CMS Webflow → key canónica.
   * En Designer: Custom Attribute name = "data-flujo-luminoso", value = campo CMS.
   * Si el valor viene vacío, no se muestra la fila.
   */
  const CMS_SPEC_ATTRS = {
    "data-autonomia": "Autonomía",
    "data-angulo-de-apertura": "Ángulo de apertura",
    "data-clase": "Clase de protección",
    "data-color": "Color del cuerpo",
    "data-cri": "CRI",
    "data-dimensiones": "Dimensiones",
    "data-funciones": "Funciones",
    "data-flujo-luminoso": "Flujo luminoso",
    "data-flujo-luminoso-nominal-total": "Flujo luminoso nominal total",
    "data-flujo-luminoso-inicial-total": "Flujo luminoso inicial total",
    "data-flujo-luminoso-estable-total": "Flujo luminoso estable total",
    "data-tipo-de-chip-led": "Tipo de chip LED",
    "data-frecuencia": "Frecuencia",
    "data-garantia-tiempo": "Garantía",
    "data-ip": "Protección IP",
    "data-lumenes-w": "Lúmenes/W",
    "data-material-cuerpo": "Material del cuerpo",
    "data-panel-tactil": "Panel táctil",
    "data-peso": "Peso",
    "data-potencia": "Potencia",
    "data-temperatura-color": "Temperatura del color",
    "data-temperatura-de-operacion": "Temperatura de operación",
    "data-tension": "Tensión",
    "data-tension-nominal": "Tensión nominal",
    "data-rango-de-tension": "Rango de tensión",
    "data-potencia-nominal-por-lampara": "Potencia nominal por lámpara",
    "data-potencia-de-entrada-por-lampara": "Potencia de entrada por lámpara",
    "data-potencia-estable-por-lampara": "Potencia estable por lámpara",
    "data-corriente-de-entrada-iin": "Corriente de entrada Iin (A)",
    "data-corriente-de-salida-iout": "Corriente de salida Iout (A)",
    "data-tiempo-de-carga": "Tiempo de carga",
    "data-tipo-de-carga": "Tipo de carga",
    "data-tipo-de-led": "Tipo de LED",
    "data-tipo-de-luz": "Tipo de luz",
    "data-dimerizable": "Dimerizable",
    "data-smart": "Smart",
    "data-control-remoto": "Control remoto",
    "data-entrada": "Entrada",
    "data-driver": "Driver",
    "data-canbus": "CANBUS",
    "data-clase-electrica": "Clase eléctrica",
    "data-temperatura-de-trabajo": "Temperatura de trabajo",
    "data-spd": "SPD",
    "data-tipo-de-blanco": "Tipo de blanco",
    "data-en62778": "EN62778",
    "data-desviacion-estandar": "Desviación estándar",
    "data-tipo-de-instalacion": "Tipo de instalación",
    "data-proteccion": "Protección",
    "data-proteccion-estanca": "Protección estanca",
    "data-tipo-de-cable": "Tipo de cable",
    "data-rpm-del-cooler": "RPM del cooler",
    "data-cooler-outer-diameter": "Cooler outer diameter",
    "data-filamentos-de-cobre": "Filamentos de cobre",
    "data-material-del-lente": "Material del lente",
    "data-ugr": "UGR",
    "data-emc": "EMC",
    "data-thd": "THD",
    "data-vida-util": "Vida útil",
    "data-tiempo-de-arranque": "Tiempo de arranque",
    "data-largo-del-cable": "Largo del cable",
  };

  function normalizeSpecKey(key) {
    if (!key) return "";
    if (SPEC_KEY_ALIASES[key]) return SPEC_KEY_ALIASES[key];
    return key;
  }

  function hasSpecValue(v) {
    if (v == null) return false;
    const s = String(v).trim();
    if (!s) return false;
    if (/^(-+|n\/?a|null|undefined|sin dato)$/i.test(s)) return false;
    return true;
  }

  function isTruthyFlag(v) {
    return /^(si|sí|true|1|yes|smart)$/i.test(String(v == null ? "" : v).trim());
  }

  const SMART_APP_LINES = new Set(["ROMA", "TOKIO"]);

  function isRomaTokioSmartProduct(el, specs) {
    const smartRaw =
      specs["Smart"] || specs["Tecnología"] || el.getAttribute("data-smart");
    if (!isTruthyFlag(smartRaw)) return false;

    const linea = normalizeLinea(
      el.getAttribute("data-linea") || el.getAttribute("data-line") || ""
    );
    if (SMART_APP_LINES.has(linea)) return true;

    const hints = [
      el.getAttribute("data-name"),
      el.getAttribute("data-family"),
      el.getAttribute("data-subfamilia"),
      specs["Subfamilia"],
      specs["Familia"],
    ]
      .map((v) => normalizeLinea(v))
      .join(" ");
    return /\bROMA\b/.test(hints) || /\bTOKIO\b/.test(hints);
  }

  function syncSmartBanner(el, specs) {
    const isSmart = isRomaTokioSmartProduct(el, specs);
    const banner = document.getElementById("smartBanner");
    if (banner) banner.hidden = !isSmart;
    const warning = document.getElementById("smartWarning");
    if (warning) warning.hidden = !isSmart;
  }

  /* Orden de jerarquía. Solo se muestran hasta TRUST_MAX visibles. */
  const TRUST_PRIORITY = [
    "garantia",
    "certificado",
    "ahorro",
    "cri",
    "dimerizable",
    "smart",
    "panel-tactil",
    "control-remoto",
    "angulo",
    "ip-ik",
    "material",
  ];
  const TRUST_MAX = 4;

  function syncTrustPriority() {
    const root = document.querySelector(".trust");
    if (!root) return;
    const byKey = {};
    root.querySelectorAll(".trust-item[data-trust]").forEach((el) => {
      byKey[el.getAttribute("data-trust")] = el;
    });
    let shown = 0;
    TRUST_PRIORITY.forEach((key) => {
      const el = byKey[key];
      if (!el) return;
      const eligible = el.getAttribute("data-trust-eligible") === "1";
      if (eligible && shown < TRUST_MAX) {
        el.hidden = false;
        shown++;
      } else {
        el.hidden = true;
      }
    });
  }

  function setTrustEligible(key, on) {
    const el = document.querySelector(`.trust-item[data-trust="${key}"]`);
    if (!el) return null;
    el.setAttribute("data-trust-eligible", on ? "1" : "0");
    return el;
  }

  /** True si el producto tiene al menos un dato del grupo "Características lumínicas". */
  function hasLuminousSpecs(specs) {
    const group = SPEC_GROUPS.find((g) => g.title === "Características lumínicas");
    if (!group || !specs) return false;
    return group.rows.some((row) => hasSpecValue(lookupSpec(specs, row.key)));
  }

  function lookupSpec(map, key) {
    if (hasSpecValue(map[key])) return String(map[key]).trim();
    for (const [alias, canonical] of Object.entries(SPEC_KEY_ALIASES)) {
      if (canonical === key && hasSpecValue(map[alias])) return String(map[alias]).trim();
    }
    return "";
  }

  let tipBubble = null;
  let tipOpenFor = null;

  const SPEC_TIP_MARK =
    '<svg class="spec-tip__mark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.1" r="0.9" fill="currentColor"/></svg>';

  function ensureTipBubble() {
    if (!tipBubble) {
      tipBubble = document.createElement("div");
      tipBubble.className = "tip-bubble";
      tipBubble.setAttribute("role", "tooltip");
      tipBubble.innerHTML = '<span class="tip-bubble__title"></span><span class="tip-bubble__body"></span>';
      document.body.appendChild(tipBubble);
    }
    return tipBubble;
  }

  function showTip(el) {
    const bubble = ensureTipBubble();
    const titleEl = bubble.querySelector(".tip-bubble__title");
    const bodyEl = bubble.querySelector(".tip-bubble__body");
    const title = el.getAttribute("data-tip-title") || el.querySelector(".spec-tip__label")?.textContent?.trim() || el.textContent.trim();
    const body = el.dataset.tip || "";
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = body;

    bubble.classList.remove("is-below");
    bubble.style.left = "-9999px";
    bubble.style.top = "-9999px";
    bubble.classList.add("show");
    el.classList.add("is-open");

    const anchor = el.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    let left = anchor.left + anchor.width / 2 - br.width / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - br.width - 10));

    let top = anchor.top - br.height - 12;
    let below = false;
    if (top < 10) {
      top = anchor.bottom + 12;
      below = true;
    }
    bubble.classList.toggle("is-below", below);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;

    const arrowX = anchor.left + anchor.width / 2 - left;
    bubble.style.setProperty("--tip-arrow-x", `${Math.max(14, Math.min(arrowX, br.width - 14))}px`);
  }

  function hideTip() {
    if (tipBubble) tipBubble.classList.remove("show");
    document.querySelectorAll(".spec-tip.is-open").forEach((el) => el.classList.remove("is-open"));
    tipOpenFor = null;
  }

  function wireTooltips(container) {
    container.querySelectorAll(".spec-tip").forEach((el) => {
      if (el.dataset.tipWired === "1") return;
      el.dataset.tipWired = "1";
      el.addEventListener("mouseenter", () => showTip(el));
      el.addEventListener("mouseleave", hideTip);
      el.addEventListener("focus", () => showTip(el));
      el.addEventListener("blur", hideTip);
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isSameOpen = tipOpenFor === el;
        hideTip();
        if (!isSameOpen) {
          showTip(el);
          tipOpenFor = el;
        }
      });
    });
  }
  document.addEventListener("click", () => hideTip());

  function syncAccordionHeights() {
    document.querySelectorAll(".spec-group.is-open .spec-body").forEach((body) => {
      body.style.maxHeight = body.scrollHeight + "px";
    });
  }

  function renderSpecGroups(specs) {
    const root = document.getElementById("specGroups");
    if (!root) return;
    const map = specs || {};
    let html = "";

    SPEC_GROUPS.forEach((group, gi) => {
      const visibleRows = group.rows
        .map((row) => {
          const val = lookupSpec(map, row.key);
          return val ? { ...row, val } : null;
        })
        .filter(Boolean);

      /* Evitar duplicar Dimerizable si ya salió en eléctricas y también está en lumínicas */
      const seenKeys = new Set();
      const uniqueRows = visibleRows.filter((r) => {
        if (seenKeys.has(r.key)) return false;
        seenKeys.add(r.key);
        return true;
      });

      if (!uniqueRows.length) return;

      const open = gi < 3;
      html += `
        <div class="spec-group${open ? " is-open" : ""}">
          <button type="button" class="spec-group-head" aria-expanded="${open ? "true" : "false"}">
            <span class="sg-title">${group.icon}<span class="sg-title-text">${escapeHtml(group.title)}</span></span>
            <span class="sg-toggle" aria-hidden="true">${open ? "\u2212" : "+"}</span>
          </button>
          <div class="spec-body" style="max-height:${open ? "none" : "0px"}">
            ${uniqueRows
              .map(
                (r) => `
              <div class="spec-row" data-spec-key="${escapeHtml(r.key)}">
                <span class="k">${
                  r.tip
                    ? `<button type="button" class="spec-tip" data-tip-title="${escapeHtml(r.key)}" data-tip="${escapeHtml(r.tip)}" aria-label="${escapeHtml(r.key)}: más información"><span class="spec-tip__label">${escapeHtml(r.key)}</span>${SPEC_TIP_MARK}</button>`
                    : escapeHtml(r.key)
                }</span>
                <span class="v" data-spec-val>${escapeHtml(r.val)}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>`;
    });

    root.innerHTML = html || `<p class="soon-note" style="color:var(--muted);font-size:14px;padding:12px 0">Sin especificaciones cargadas.</p>`;

    /* Deduplicar Dimerizable entre grupos: si aparece en eléctricas, quitar de lumínicas */
    const electricGroup = [...root.querySelectorAll(".spec-group")].find((g) =>
      g.querySelector(".sg-title-text")?.textContent?.includes("eléctricas")
    );
    const luminicGroup = [...root.querySelectorAll(".spec-group")].find((g) =>
      g.querySelector(".sg-title-text")?.textContent?.includes("lumínicas")
    );
    if (electricGroup && luminicGroup) {
      const hasDimE = electricGroup.querySelector('[data-spec-key="Dimerizable"]');
      const dimL = luminicGroup.querySelector('[data-spec-key="Dimerizable"]');
      if (hasDimE && dimL) dimL.remove();
      if (!luminicGroup.querySelector(".spec-row")) luminicGroup.hidden = true;
    }

    wireTooltips(root);
    requestAnimationFrame(syncAccordionHeights);
  }

  const specGroupsRoot = document.getElementById("specGroups");
  const commercialGroupsRoot = document.getElementById("commercialGroups");

  function onSpecAccordionClick(e) {
    const head = e.target.closest(".spec-group-head");
    if (!head || e.target.closest(".spec-tip")) return;
    const group = head.closest(".spec-group");
    const body = group.querySelector(".spec-body");
    const toggle = head.querySelector(".sg-toggle");
    group.classList.toggle("is-open");
    const open = group.classList.contains("is-open");
    head.setAttribute("aria-expanded", open ? "true" : "false");
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    toggle.textContent = open ? "\u2212" : "+";
  }

  if (specGroupsRoot) specGroupsRoot.addEventListener("click", onSpecAccordionClick);
  if (commercialGroupsRoot) commercialGroupsRoot.addEventListener("click", onSpecAccordionClick);
  window.addEventListener("resize", syncAccordionHeights);

  function syncQuickSpecs(specs) {
    const root = document.querySelector(".quick-specs");
    if (!root) return;
    let visible = 0;
    root.querySelectorAll(".qspec").forEach((block) => {
      const key = normalizeSpecKey(block.getAttribute("data-spec-key"));
      const valEl = block.querySelector("[data-spec-val]");
      let val = lookupSpec(specs, key);
      /* En "Luz" mostramos la categoría (Cálido/Neutro/Frío/RGB): el Kelvin exacto
         ya aparece en el chip de variante y en la tabla de especificaciones. */
      if (key === "Temperatura del color") {
        const tipo = lookupSpec(specs, "Tipo de luz");
        const cat = tempCategory(tipo) || tempCategory(val);
        val = (cat && TEMP_LABELS[cat]) || tipo || val;
      }
      if (valEl) valEl.textContent = val || "";
      const on = hasSpecValue(val);
      block.hidden = !on;
      if (on) visible++;
    });
    root.setAttribute("data-count", String(visible));
    root.hidden = visible === 0;
    const charsBlock = root.closest(".chars-block");
    if (charsBlock) charsBlock.hidden = visible === 0;
  }

  function syncCommercialTable(specs, extra) {
    const map = Object.assign({}, specs, extra || {});
    const table = document.getElementById("commercialTable");
    const group = document.getElementById("commercialGroup");
    let visible = 0;
    document.querySelectorAll("#panel-commercial [data-spec-key]").forEach((block) => {
      const key = block.getAttribute("data-spec-key");
      const valEl = block.querySelector("[data-spec-val]");
      let val = "";
      if (key === "SKU") val = map.SKU || "";
      else if (key === "EAN13") val = map.EAN13 || "";
      else if (key === "Familia") val = map.Familia || "";
      else if (key === "Macrofamilia") val = map.Macrofamilia || "";
      else val = lookupSpec(map, key);
      if (valEl && val) valEl.textContent = val;
      const on = hasSpecValue(val);
      block.hidden = !on;
      if (on) visible++;
    });
    if (group) group.hidden = visible === 0;
    if (table) {
      wireTooltips(table);
      if (group && group.classList.contains("is-open")) {
        table.style.maxHeight = table.scrollHeight + "px";
      }
    }
  }

  function updateSpecVals(specs, extra) {
    const map = Object.assign({}, specs, extra || {});
    renderSpecGroups(map);
    syncQuickSpecs(map);
    syncCommercialTable(map, extra);
  }

  function refreshOpenAccordions() {
    syncAccordionHeights();
  }

  /* —— Compatible (reemplazado por destacados.js / Typesense) —— */

  /* —— Variants (CMS siblings) —— */

  /**
   * "Nombre ATTR_Variantes" del CMS → claves de spec que pueden contener ese valor.
   * Las claves del objeto van normalizadas (sin acentos, minúsculas) porque el CMS
   * trae variaciones como "Ángulo ", "angulo" o "Temperatura de color".
   */
  const DIM_LABEL_CANDIDATES = {
    color: ["Color del cuerpo", "Color"],
    "color del cuerpo": ["Color del cuerpo", "Color"],
    luz: ["Temperatura del color", "Tipo de luz"],
    "tipo de luz": ["Tipo de luz", "Temperatura del color"],
    temperatura: ["Temperatura del color", "Tipo de luz"],
    "temperatura de color": ["Temperatura del color", "Tipo de luz"],
    "temperatura del color": ["Temperatura del color", "Tipo de luz"],
    cct: ["Temperatura del color", "Tipo de luz"],
    angulo: ["Ángulo de apertura"],
    "angulo de apertura": ["Ángulo de apertura"],
    apertura: ["Ángulo de apertura"],
    potencia: ["Potencia"],
    conector: ["Conector", "Conexión"],
    conexion: ["Conexión", "Conector"],
    ip: ["Protección IP"],
    "proteccion ip": ["Protección IP"],
    medida: ["Dimensiones"],
    medidas: ["Dimensiones"],
    dimensiones: ["Dimensiones"],
    tension: ["Tensión"],
    material: ["Material del cuerpo"],
    "material del cuerpo": ["Material del cuerpo"],
    "flujo luminoso": ["Flujo luminoso"],
    "cantidad de luces": ["Cantidad de luces"],
  };

  /* Identificadores y datos comerciales: nunca son el eje de una variante. */
  const NON_DIM_KEYS = new Set([
    "SKU",
    "EAN13",
    "Familia",
    "Macrofamilia",
    "Subfamilia",
    "Garantía",
  ]);

  /* Orden de preferencia cuando el CMS no declara "Nombre ATTR_Variantes". */
  const DIM_AUTODETECT_PRIORITY = [
    "Color del cuerpo",
    "Temperatura del color",
    "Tipo de luz",
    "Ángulo de apertura",
    "Potencia",
    "Conector",
    "Conexión",
    "Protección IP",
    "Dimensiones",
  ];

  const COLOR_SWATCH = {
    blanco: "#f4f4f4",
    negro: "#1a1a1a",
    rojo: "#c62828",
    verde: "#2e7d32",
    azul: "#1565c0",
    amarillo: "#f9a825",
    gris: "#9e9e9e",
    bronce: "#b08d57",
    cobre: "#b87333",
    dorado: "#c9a227",
    plata: "#c0c0c0",
    plateado: "#c0c0c0",
    platil: "#c0c0c0",
    cromo: "#cfd4d8",
    niquel: "#b6b6b6",
    madera: "#a97142",
    aluminio: "#d6d8da",
    cromado: "#cfd4d8",
    transparente: "repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 8px 8px",
  };

  function normKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /* Specs que describen el color de la luz (no el del cuerpo del artefacto). */
  const TEMP_SPEC_KEYS = new Set(["Temperatura del color", "Tipo de luz"]);

  const TEMP_LABELS = {
    calido: "Cálido",
    neutro: "Neutro",
    frio: "Frío",
    cct: "CCT",
    rgb: "RGB",
    rgbw: "RGB+W",
  };

  /* Mismos tonos que los badges de las cards (destacados.js). */
  const RGB_WHEEL = "#ff3b30,#ffcc00,#34c759,#00bcd4,#5856d6,#ff2d55,#ff3b30";
  const TEMP_SWATCH = {
    calido: "#fff79b",
    neutro: "#d9d9d9",
    frio: "#bce4fa",
    ambar: "#f9a825",
    azul: "#1565c0",
    verde: "#2e7d32",
    rojo: "#c62828",
    amarillo: "#f9d923",
    cct: "linear-gradient(90deg,#fff79b,#d9d9d9,#bce4fa)",
    rgb: `conic-gradient(${RGB_WHEEL})`,
    rgbw: `conic-gradient(#ffffff 0 25%,${RGB_WHEEL})`,
  };

  /**
   * "2700K" → calido, "6500K" → frio, "RGB+W" → rgbw,
   * "2700K a 6500K" → cct (sintonizable, no es un tono fijo).
   */
  function kelvinsIn(value) {
    return normKey(value).match(/\d{4}/g) || [];
  }

  function tempCategory(value) {
    const v = normKey(value);
    if (!v) return null;
    if (v.indexOf("rgb") !== -1) return /rgb\s*\+?\s*w|rgbw/.test(v) ? "rgbw" : "rgb";
    if (/calid|warm/.test(v)) return "calido";
    if (/neutr/.test(v)) return "neutro";
    if (/frio|cool/.test(v)) return "frio";
    if (/ambar|amber/.test(v)) return "ambar";
    if (/azul|blue/.test(v)) return "azul";
    if (/verde|green/.test(v)) return "verde";
    if (/rojo|red/.test(v)) return "rojo";
    if (/amarill|yellow/.test(v)) return "amarillo";

    const kelvins = kelvinsIn(value);
    if (!kelvins.length) return null;
    if (kelvins.length > 1) return "cct";
    const k = parseInt(kelvins[0], 10);
    if (k <= 3500) return "calido";
    if (k <= 5000) return "neutro";
    return "frio";
  }

  /* Cálido → neutro → frío → CCT → RGB → RGB+W, y dentro del blanco por Kelvin. */
  function tempSort(a, b) {
    const TIER = { cct: 2, rgb: 3, rgbw: 4 };
    const catA = tempCategory(a);
    const catB = tempCategory(b);
    const tierA = TIER[catA] || 1;
    const tierB = TIER[catB] || 1;
    if (tierA !== tierB) return tierA - tierB;

    if (tierA === 1) {
      const ka = kelvinsIn(a);
      const kb = kelvinsIn(b);
      if (ka.length === 1 && kb.length === 1) {
        const diff = parseInt(ka[0], 10) - parseInt(kb[0], 10);
        if (diff) return diff;
      }
      const BLANCOS = ["calido", "neutro", "frio"];
      const ia = BLANCOS.indexOf(catA);
      const ib = BLANCOS.indexOf(catB);
      if (ia !== ib) return ia - ib;
    }

    return String(a).localeCompare(String(b), "es");
  }

  const variantsTarget = document.getElementById("product-variants") || document.querySelector(".container_variants");

  function parseList(raw) {
    return String(raw || "")
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseSpecs(el) {
    const out = {};

    /* 1) data-specs JSON opcional (legacy / fallback) */
    try {
      let rawJson = el.getAttribute("data-specs");
      if (rawJson) {
        /* Webflow a veces deja espacios/newlines; limpiar comas colgantes leves */
        rawJson = String(rawJson)
          .replace(/,\s*([}\]])/g, "$1")
          .trim();
        const parsed = JSON.parse(rawJson) || {};
        Object.keys(parsed).forEach((k) => {
          if (!hasSpecValue(parsed[k])) return;
          out[normalizeSpecKey(k)] = String(parsed[k]).trim();
        });
      }
    } catch (e) {
      console.warn("JSON inválido en data-specs de", el.getAttribute("data-sku"), e);
    }

    /* 2) Campos CMS individuales (ganan sobre JSON si ambos existen) */
    Object.keys(CMS_SPEC_ATTRS).forEach((attr) => {
      const raw = el.getAttribute(attr);
      if (!hasSpecValue(raw)) return;
      out[CMS_SPEC_ATTRS[attr]] = String(raw).trim();
    });

    return out;
  }

  function slugify(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function variantSort(a, b) {
    const colorOrder = ["blanco", "negro", "gris", "plata", "platil", "rojo", "verde", "azul", "bronce", "cobre"];
    const ia = colorOrder.indexOf(normKey(a));
    const ib = colorOrder.indexOf(normKey(b));
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    const na = parseFloat(String(a).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
    const nb = parseFloat(String(b).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
    if (na !== nb) return na - nb;
    return String(a).localeCompare(String(b), "es");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(sel, value) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (el && value != null && value !== "") el.textContent = value;
  }

  function setHref(sel, url) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (el && url) el.href = url;
  }

  function isValidFileUrl(url) {
    const u = String(url || "").trim();
    return !!(u && u !== "#" && !/^javascript:/i.test(u));
  }

  function setDownloadBtnLabel(btn, label) {
    if (!btn) return;
    const svg = btn.querySelector("svg");
    btn.textContent = "";
    if (svg) btn.appendChild(svg);
    btn.appendChild(document.createTextNode(" " + label));
  }

  /**
   * Botones de descarga del hero (arriba de comparar):
   * primario = ficha → si no hay, catálogo → si no hay, manual.
   * secundario = el siguiente disponible de esa misma prioridad.
   */
  function syncActionDownloads(fichaUrl, catalogoUrl, manualUrl) {
    const btnPrimary = document.getElementById("btn-ficha");
    const btnSecondary = document.getElementById("btn-catalogo");
    const actions = document.querySelector(".cta-stack .actions");

    const hasManualOverride = btnPrimary && btnPrimary.getAttribute("data-cta-mode") === "contact";
    const contactUrl = (btnPrimary && btnPrimary.getAttribute("data-contact-url")) || "https://www.electroestrada.com.ar/";

    const docs = [
      {
        key: "ficha",
        url: fichaUrl,
        primaryLabel: "Descargar ficha técnica",
        secondaryLabel: "Ficha técnica",
      },
      {
        key: "catalogo",
        url: catalogoUrl,
        primaryLabel: "Descargar catálogo",
        secondaryLabel: "Catálogo",
      },
      {
        key: "manual",
        url: manualUrl,
        primaryLabel: "Descargar manual",
        secondaryLabel: "Manual",
      },
    ].filter((d) => isValidFileUrl(d.url));

    const contactDoc = {
      key: "contacto",
      url: contactUrl,
      primaryLabel: "Contacto comercial",
      secondaryLabel: "Contacto comercial",
    };

    const finalDocs = hasManualOverride ? [contactDoc, ...docs.filter((d) => d.key !== "ficha")] : docs;

    const apply = (btn, doc, isPrimary) => {
      if (!btn) return;
      if (!doc) {
        btn.hidden = true;
        btn.removeAttribute("href");
        return;
      }
      btn.hidden = false;
      btn.href = doc.url;
      btn.target = "_blank";
      btn.rel = "noopener";
      setDownloadBtnLabel(btn, isPrimary ? doc.primaryLabel : doc.secondaryLabel);
    };

    apply(btnPrimary, finalDocs[0] || null, true);
    apply(btnSecondary, finalDocs[1] || null, false);
    if (actions) actions.hidden = finalDocs.length === 0;
  }

  function syncFileCards(files) {
    const map = {
      ficha: files && files.ficha,
      garantia: files && files.garantia,
      manual: files && files.manual,
      catalogo: files && files.catalogo,
      ies: files && files.ies,
    };
    let visibleCount = 0;
    document.querySelectorAll("#files-list .dl-card").forEach((card) => {
      const key = card.getAttribute("data-file");
      const url = (map[key] || "").trim();
      if (url && url !== "#") {
        card.href = url;
        card.hidden = false;
        visibleCount++;
      } else {
        card.removeAttribute("href");
        card.hidden = true;
      }
    });

    // Ningún documento cargado para este SKU: se oculta el tab en vez de
    // mostrarlo vacío (mismo criterio que armados/despiece/compatibles).
    const tabFiles = document.getElementById("tab-files");
    if (tabFiles) {
      const wasActive = tabFiles.classList.contains("is-active");
      tabFiles.hidden = visibleCount === 0;
      if (visibleCount === 0 && wasActive) {
        const fallback = document.querySelector('.tab[data-tab="specs"]');
        if (fallback) fallback.click();
      }
    }
  }

  let heroItem = null;
  let siblings = [];
  let dimensionKeys = [];
  /* Video "de familia": la mayoría de las variantes (color/tamaño) no cargan
     su propio campo Video en el CMS — solo el SKU elegido como hero lo tiene.
     Se guarda acá para no perder el video al cambiar de variante. */
  let sharedVideoSrc = [];
  let sharedVideoPoster = "";

  /**
   * Las hermanas salen de la Collection List atada a Variantes_Multireference:
   * todo lo que esa lista renderiza ES una variante del producto actual, así que
   * alcanza con marcarlas con data-variant-item. El campo de texto
   * data-variantes-sku queda solo como fallback para el mock local.
   */
  function collectSiblings(current) {
    const currentSku = (current.getAttribute("data-sku") || "").trim();
    const bySku = new Map();
    const push = (el) => {
      const sku = (el.getAttribute("data-sku") || "").trim();
      if (!sku || bySku.has(sku)) return;
      bySku.set(sku, el);
    };

    /* El héroe primero: si el multi-reference se incluye a sí mismo, gana el embed
       del héroe, que es el que trae la ficha completa. */
    push(current);
    document.querySelectorAll(".cms-product-item[data-variant-item]").forEach(push);

    if (bySku.size <= 1) {
      const wanted = new Set(parseList(current.getAttribute("data-variantes-sku")));
      document.querySelectorAll(".cms-product-item").forEach((el) => {
        const sku = (el.getAttribute("data-sku") || "").trim();
        if (wanted.has(sku) || parseList(el.getAttribute("data-variantes-sku")).indexOf(currentSku) !== -1) {
          push(el);
        }
      });
    }

    return Array.from(bySku.values());
  }

  function specValues(sibs, key) {
    const values = new Set();
    sibs.forEach((el) => {
      const value = (parseSpecs(el)[key] || "").trim();
      if (value) values.add(value);
    });
    return values;
  }

  function allSpecKeys(sibs) {
    const keys = new Set();
    sibs.forEach((el) => Object.keys(parseSpecs(el)).forEach((key) => keys.add(key)));
    return Array.from(keys);
  }

  /**
   * Devuelve la clave de spec que diferencia a las variantes, o [] si ninguna lo
   * hace (en ese caso los chips se etiquetan por nombre/SKU).
   */
  /* Resuelve un término declarado (ej. "temperatura", "Ángulo de apertura") a la
     clave de spec real que efectivamente difiere entre hermanas, o null si no matchea. */
  function resolveOneDeclared(term, sibs, differs) {
    const declared = normKey(term);
    if (!declared) return null;
    const candidates = (DIM_LABEL_CANDIDATES[declared] || []).concat(
      allSpecKeys(sibs).filter((key) => normKey(key) === declared)
    );
    return candidates.find(differs) || null;
  }

  function resolveDimensions(current, sibs) {
    const differs = (key) => !NON_DIM_KEYS.has(key) && specValues(sibs, key).size > 1;

    /* Campo nuevo: lista de atributos separados por ; o , — soporta varios ejes
       de variación a la vez (ej. "Ángulo de apertura;Potencia"). Prioridad sobre
       el campo viejo de un solo atributo. */
    const multiRaw = (current.getAttribute("data-attr-variantes") || "").trim();
    if (multiRaw) {
      const terms = multiRaw.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
      const resolved = [];
      const seen = new Set();
      terms.forEach((term) => {
        const hit = resolveOneDeclared(term, sibs, differs);
        if (hit && !seen.has(normKey(hit))) {
          seen.add(normKey(hit));
          resolved.push(hit);
        } else if (!hit) {
          console.warn(
            `[variantes] "${term}" (declarado en Atributos Variantes) no matchea ningún spec que difiera entre hermanas.`
          );
        }
      });
      if (resolved.length) return resolved;
      console.warn(
        `[variantes] "${multiRaw}" no resolvió ningún atributo válido. Autodetectando…`
      );
    }

    /* Campo viejo (legacy, un solo atributo): se mantiene para productos que
       todavía no migraron al campo nuevo. */
    const declaredRaw = (current.getAttribute("data-nombre-attr-variantes") || "").trim();
    if (declaredRaw) {
      const hit = resolveOneDeclared(declaredRaw, sibs, differs);
      if (hit) return [hit];
      console.warn(
        `[variantes] el CMS declara "${declaredRaw}" pero ningún campo con ese valor difiere entre las variantes. Autodetectando…`
      );
    }

    /* Autodetección: ahora junta TODOS los atributos que difieran (no solo el
       primero), respetando el orden de prioridad y agregando al final cualquier
       otro spec fuera de esa lista que también difiera. */
    const seen = new Set();
    const auto = [];
    DIM_AUTODETECT_PRIORITY.forEach((key) => {
      if (differs(key) && !seen.has(normKey(key))) {
        seen.add(normKey(key));
        auto.push(key);
      }
    });
    allSpecKeys(sibs).forEach((key) => {
      if (differs(key) && !seen.has(normKey(key))) {
        seen.add(normKey(key));
        auto.push(key);
      }
    });
    return auto;
  }

  const CHIP_LABELS = {
    "Color del cuerpo": "Color",
    "Temperatura del color": "Temperatura",
    "Ángulo de apertura": "Ángulo",
    "Protección IP": "Protección",
  };

  function renderChipGroup(label, groupName, entries, activeValue) {
    let html =
      `<div class="variant-group"><span class="variant-label">${escapeHtml(label)}</span>` +
      `<div class="variant-chips" role="radiogroup" aria-label="${escapeHtml(label)}">`;
    entries.forEach((entry) => {
      const isActive = entry.value === activeValue;
      const isUnavailable = !!entry.unavailable && !isActive;
      const inputId = groupName + "--" + slugify(entry.value);
      const swatch = entry.swatch
        ? `<span class="variant-swatch" style="background:${entry.swatch}" aria-hidden="true"></span>`
        : "";
      const chipClass =
        "variant-chip" + (isActive ? " active" : "") + (isUnavailable ? " is-unavailable" : "");
      html +=
        `<label for="${inputId}" class="${chipClass}"` +
        (isUnavailable
          ? ` title="${escapeHtml(entry.value)}: no disponible en esta combinación"`
          : "") +
        `>` +
        `<input type="radio" class="variant-chip-radio" id="${inputId}" name="${groupName}"` +
        ` data-dim="${escapeHtml(entry.dim || "")}" data-val="${escapeHtml(entry.value)}"` +
        (entry.sku ? ` data-sku="${escapeHtml(entry.sku)}"` : "") +
        (isActive ? " checked" : "") +
        `>` +
        swatch +
        escapeHtml(entry.value) +
        `</label>`;
    });
    return html + "</div></div>";
  }

  /* "PAR16-AL-6.5W-DIM-12D-WW" → "12D-WW": se recorta el tramo que comparten todos. */
  function stripCommonSkuPrefix(skus) {
    if (skus.length < 2) return skus.slice();
    const parts = skus.map((sku) => sku.split("-"));
    const min = Math.min(...parts.map((p) => p.length));
    let common = 0;
    while (common < min - 1 && parts.every((p) => p[common] === parts[0][common])) common += 1;
    const short = parts.map((p) => p.slice(common).join("-"));
    return new Set(short).size === skus.length ? short : skus.slice();
  }

  /* Sin spec que las distinga, se etiqueta por nombre; si los nombres se repiten, por SKU. */
  function fallbackChipEntries(sibs) {
    const skus = sibs.map((el) => (el.getAttribute("data-sku") || "").trim());
    const names = sibs.map((el) => (el.getAttribute("data-name") || "").trim());
    const useName = new Set(names.filter(Boolean)).size === sibs.length;
    const shortSkus = stripCommonSkuPrefix(skus);
    return sibs
      .map((el, i) => ({
        sku: skus[i],
        value: (useName ? names[i] : shortSkus[i]) || skus[i],
        swatch: "",
      }))
      .sort((a, b) => variantSort(a.value, b.value));
  }

  /**
   * Disponibilidad en cascada: un valor de `key` se tacha solo si no hay ninguna
   * hermana que lo tenga Y coincida con la selección actual en las dimensiones QUE
   * VIENEN ANTES en dimensionKeys (nunca contra las que vienen después).
   *
   * Esto evita el candado cruzado: si Potencia es la primera dimensión declarada,
   * sus chips nunca se tachan por culpa de un Ángulo ya elegido (100W existe, solo
   * que con otro ángulo). El Ángulo sí se filtra por la Potencia/Temperatura ya
   * elegidas, porque es la dimensión más específica y depende de las anteriores.
   */
  function isCombinationAvailable(currentSpecs, key, value) {
    const idx = dimensionKeys.indexOf(key);
    const priorKeys = idx > 0 ? dimensionKeys.slice(0, idx) : [];
    return siblings.some((el) => {
      const specs = parseSpecs(el);
      if ((specs[key] || "").trim() !== value) return false;
      return priorKeys.every((k) => (specs[k] || "").trim() === (currentSpecs[k] || "").trim());
    });
  }

  function buildChipsHtml() {
    if (!variantsTarget || !heroItem) return "";
    const currentSpecs = parseSpecs(heroItem);
    let html = "";

    if (dimensionKeys.length) {
      dimensionKeys.forEach((key) => {
        /* "Temperatura del color" contiene "color", así que se chequea primero. */
        const isTempDim = TEMP_SPEC_KEYS.has(key);
        const isBodyColorDim = !isTempDim && normKey(key).indexOf("color") !== -1;
        const values = [...specValues(siblings, key)].sort(isTempDim ? tempSort : variantSort);
        if (values.length <= 1) return;
        const swatchFor = (value) => {
          if (isTempDim) return TEMP_SWATCH[tempCategory(value)] || "";
          if (isBodyColorDim) return COLOR_SWATCH[normKey(value)] || "";
          return "";
        };
        html += renderChipGroup(
          CHIP_LABELS[key] || key,
          "variant-" + slugify(key),
          values.map((value) => ({
            value,
            dim: key,
            swatch: swatchFor(value),
            unavailable:
              dimensionKeys.length > 1 && !isCombinationAvailable(currentSpecs, key, value),
          })),
          (currentSpecs[key] || "").trim()
        );
      });
    } else if (siblings.length > 1) {
      const declared = (heroItem.getAttribute("data-nombre-attr-variantes") || "").trim();
      const heroSku = (heroItem.getAttribute("data-sku") || "").trim();
      const entries = fallbackChipEntries(siblings);
      const active = entries.find((entry) => entry.sku === heroSku);
      html += renderChipGroup(
        declared || "Variante",
        "variant-fallback",
        entries,
        active ? active.value : ""
      );
    }

    variantsTarget.hidden = !html;
    variantsTarget.style.display = html ? "flex" : "none";
    return html;
  }

  function findMatchForInput(input) {
    const sku = (input.getAttribute("data-sku") || "").trim();
    if (sku) {
      return siblings.find((el) => (el.getAttribute("data-sku") || "").trim() === sku) || null;
    }
    return findBestMatch(input.getAttribute("data-dim"), input.getAttribute("data-val"));
  }

  function findBestMatch(desiredKey, desiredVal) {
    const currentSpecs = parseSpecs(heroItem);
    const candidates = siblings.filter(
      (el) => (parseSpecs(el)[desiredKey] || "").trim() === desiredVal
    );
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];

    let best = candidates[0];
    let bestScore = -1;
    candidates.forEach((el) => {
      const specs = parseSpecs(el);
      let score = 0;
      dimensionKeys.forEach((k) => {
        if (k !== desiredKey && (specs[k] || "").trim() === (currentSpecs[k] || "").trim()) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    });
    return best;
  }

  /* El campo "Familia" del CMS (ej. "Galponeras Standard") es más fino que
     el facet "familia" que filtra /nuevo-productos (ej. "Galponeras") — son
     taxonomías distintas. Linkear con el valor del CMS deja el filtro sin
     resultados. Se resuelve el valor real contra Typesense por SKU. */
  const TS_HOST = "https://typesense.coresagroup.com";
  const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
  const TS_COLLECTION = "Macroled_Prueba";
  const familiaCache = Object.create(null);

  async function fetchLiveFamilia(sku) {
    if (!sku) return null;
    if (familiaCache[sku] !== undefined) return familiaCache[sku];
    try {
      const params = new URLSearchParams({
        q: "*",
        query_by: "sku",
        filter_by: `sku:=${JSON.stringify(sku)}`,
        include_fields: "familia,macrofamilia",
        per_page: "1",
      });
      const res = await fetch(
        `${TS_HOST}/collections/${encodeURIComponent(TS_COLLECTION)}/documents/search?${params}`,
        { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY } }
      );
      if (!res.ok) throw new Error(`Typesense ${res.status}`);
      const data = await res.json();
      const doc = (data.hits || [])[0] && data.hits[0].document;
      const result = doc && doc.familia ? { familia: doc.familia, macrofamilia: doc.macrofamilia || "" } : null;
      familiaCache[sku] = result;
      return result;
    } catch (err) {
      console.warn("[crumb] no se pudo resolver la familia real desde Typesense", err);
      familiaCache[sku] = null;
      return null;
    }
  }

  function setCrumbFamilyLink(macro, family) {
    const familyLink = document.getElementById("crumb-family");
    if (!familyLink) return;
    const params = new URLSearchParams();
    if (macro) params.set("macrofamilia", macro);
    if (family) params.set("familia", family);
    if ([...params].length) {
      familyLink.setAttribute("href", "/nuevo-productos?" + params.toString());
    } else {
      familyLink.removeAttribute("href");
    }
  }

  function applyCrumbFamily(sku, macro, family) {
    // Fallback inmediato con lo que ya tenemos del CMS, mientras se resuelve
    // el valor real (evita que el breadcrumb quede vacío mientras carga).
    setText("#crumb-family", family);
    setCrumbFamilyLink(macro, family);
    fetchLiveFamilia(sku).then((live) => {
      if (!live) return;
      setText("#crumb-family", live.familia);
      setCrumbFamilyLink(live.macrofamilia || macro, live.familia);
    });
  }

  function applyProduct(el, opts) {
    opts = opts || {};
    const specs = parseSpecs(el);
    const sku = (el.getAttribute("data-sku") || "").trim();
    const name = (el.getAttribute("data-name") || "").trim();
    const link = (el.getAttribute("data-product-url") || el.getAttribute("data-link") || "").trim();
    const ean13 = (el.getAttribute("data-ean13") || "").trim();
    const multiimage = parseList(el.getAttribute("data-multiimage"));
    const image = (el.getAttribute("data-image") || "").trim();
    const videoRaw =
      el.getAttribute("data-video") ||
      el.getAttribute("data-videos") ||
      "";
    let videos = parseList(videoRaw);
    let videoPoster = resolveVideoPoster(el, videos, image);
    if (!videos.length && sharedVideoSrc.length) {
      videos = sharedVideoSrc.slice();
      videoPoster = sharedVideoPoster || videoPoster;
    }
    const description = (el.getAttribute("data-descripcion") || "").trim();
    const family = (el.getAttribute("data-family") || "").trim();
    const macro = (el.getAttribute("data-macrofamilia") || "").trim();
    const fichaUrl = (el.getAttribute("data-ficha") || "").trim();
    const garantiaUrl = (el.getAttribute("data-garantia") || "").trim();
    const catalogoUrl = (el.getAttribute("data-catalogo") || "").trim();
    const manualUrl = (el.getAttribute("data-manual") || "").trim();
    const iesUrl = (el.getAttribute("data-ies") || "").trim();

    setText("#ficha-name", name);
    setText(".info h1", name);
    setText("#crumb-name", name);
    setText("#ficha-sku", sku);
    setText("#ficha-ean", ean13);
    setText("#ficha-lead", description);
    if (macro || family) {
      setText("#ficha-eyebrow", [macro, family].filter(Boolean).join(" · "));
    }
    applyCrumbFamily(sku, macro, family);
    setText("#aiProductName", name);
    setText("#aiProductMeta", `SKU ${sku}${macro ? " · " + macro : ""}`);

    document.title = `${name} — MACROLED`;

    const images = multiimage.length ? multiimage.slice() : image ? [image] : [];
    const media = [];
    images.forEach((u) => {
      if (u && !media.includes(u)) media.push(u);
    });
    videos.forEach((v) => {
      if (v && !media.includes(v)) media.push(v);
    });
    setGallery(media, name, { poster: videoPoster });
    if (videos.length && !GALLERY.some((g) => isVideoType(g.type))) {
      console.warn("[galeria] data-video presente pero no entró a la galería", videos);
    }

    const nuevoRaw = (el.getAttribute("data-nuevo") || "").trim().toLowerCase();
    const isNuevo = ["true", "1", "si", "sí", "yes"].includes(nuevoRaw);
    const stageBadge = document.getElementById("stage-badge");
    if (stageBadge) {
      stageBadge.textContent = "Nuevo";
      stageBadge.hidden = !isNuevo;
    }

    syncActionDownloads(fichaUrl, catalogoUrl, manualUrl);
    syncFileCards({
      ficha: fichaUrl,
      garantia: garantiaUrl,
      manual: manualUrl,
      catalogo: catalogoUrl,
      ies: iesUrl,
    });

    updateSpecVals(specs, {
      SKU: sku,
      EAN13: ean13,
      Familia: family,
      Macrofamilia: macro,
    });

    const ipVal = (specs["Protección IP"] || "").trim();
    const ikVal = (specs["Protección IK"] || "").trim();
    const trustIp = document.querySelector("[data-trust-ip]");
    const trustIk = document.querySelector("[data-trust-ik]");
    if (trustIp) {
      trustIp.textContent = ipVal;
      trustIp.hidden = !ipVal;
    }
    if (trustIk) {
      trustIk.textContent = ikVal;
      trustIk.hidden = !ikVal;
    }
    setTrustEligible("ip-ik", !!(ipVal || ikVal));

    const garVal = (specs["Garantía"] || "").trim();
    const trustGarEl = document.querySelector("[data-trust-garantia]");
    if (trustGarEl) trustGarEl.textContent = garVal;
    setTrustEligible("garantia", !!garVal);

    /* Sellos fijos de marca: certificado siempre; eficiencia solo si hay datos lumínicos */
    setTrustEligible("certificado", true);
    setTrustEligible("ahorro", hasLuminousSpecs(specs));

    const potVal = (specs["Potencia"] || "").trim();
    const tenVal = (specs["Tensión"] || "").trim();

    const criVal = (specs["CRI"] || "").trim();
    const trustCriEl = document.querySelector("[data-trust-cri]");
    if (trustCriEl) trustCriEl.textContent = criVal;
    setTrustEligible("cri", !!criVal);

    const dimVal = specs["Dimerizable"];
    setTrustEligible("dimerizable", isTruthyFlag(dimVal));

    const smartRaw =
      specs["Smart"] || specs["Tecnología"] || el.getAttribute("data-smart");
    setTrustEligible("smart", isTruthyFlag(smartRaw));

    const panelRaw = specs["Panel táctil"] || el.getAttribute("data-panel-tactil");
    setTrustEligible("panel-tactil", hasSpecValue(panelRaw) && !/^(no|false|0)$/i.test(String(panelRaw).trim()));

    const remoteRaw = specs["Control remoto"] || el.getAttribute("data-control-remoto");
    setTrustEligible(
      "control-remoto",
      hasSpecValue(remoteRaw) && !/^(no|false|0)$/i.test(String(remoteRaw).trim())
    );

    const angVal = (specs["Ángulo de apertura"] || "").trim();
    const trustAngEl = document.querySelector("[data-trust-angulo]");
    if (trustAngEl) trustAngEl.textContent = angVal;
    setTrustEligible("angulo", !!angVal);

    const matVal = (
      specs["Material del cuerpo"] ||
      specs["Material"] ||
      specs["Material de tapa"] ||
      ""
    ).trim();
    const trustMatEl = document.querySelector("[data-trust-material]");
    if (trustMatEl) trustMatEl.textContent = matVal;
    setTrustEligible("material", !!matVal);

    syncTrustPriority();
    syncSmartBanner(el, specs);

    const PRODUCT_CTX = window.__mlProductCtx || (window.__mlProductCtx = {});
    PRODUCT_CTX.name = name;
    PRODUCT_CTX.sku = sku;
    PRODUCT_CTX.power = potVal;
    PRODUCT_CTX.voltage = tenVal;
    PRODUCT_CTX.warranty = garVal;
    PRODUCT_CTX.ficha = fichaUrl;
    PRODUCT_CTX.manual = manualUrl || garantiaUrl;
    /* Contexto del producto activo para el asistente (SKU que se manda a n8n). */
    PRODUCT_CTX.specs = Object.assign({}, specs, {
      SKU: sku,
      EAN13: ean13,
      Familia: family,
      Macrofamilia: macro,
    });
    PRODUCT_CTX.ean13 = ean13;
    PRODUCT_CTX.family = family;
    PRODUCT_CTX.macro = macro;
    PRODUCT_CTX.description = description;
    PRODUCT_CTX.contactoUrl = CONTACTO_URL;

    if (typeof assistant !== "undefined" && assistant && typeof assistant.renderSuggestions === "function") {
      assistant.renderSuggestions();
    }

    heroItem = el;
    if (variantsTarget) variantsTarget.innerHTML = buildChipsHtml();
    refreshOpenAccordions();

    if (!opts.skipHistory && link && link !== "#") {
      const path = link.startsWith("/") ? link : "/" + link;
      if (window.location.pathname !== path) {
        window.history.pushState({ sku }, "", path);
      }
    }

    window.dispatchEvent(new CustomEvent("ml-product-changed", { detail: { sku } }));
  }

  /**
   * El embed del héroe y los de la Collection List de variantes se montan en
   * cualquier orden, así que no alcanza con tomar el primero del DOM.
   */
  function pickHeroItem() {
    const all = Array.prototype.slice.call(document.querySelectorAll(".cms-product-item"));
    if (!all.length) return null;

    const explicit = all.find((el) => el.hasAttribute("data-hero"));
    if (explicit) return explicit;

    const nonVariant = all.filter((el) => !el.hasAttribute("data-variant-item"));
    if (nonVariant.length === 1) return nonVariant[0];

    const initialSku = (document.getElementById("ficha-sku")?.textContent || "").trim();
    const bySku = (list) => list.find((el) => (el.getAttribute("data-sku") || "").trim() === initialSku);
    return (initialSku && (bySku(nonVariant) || bySku(all))) || nonVariant[0] || all[0];
  }

  let variantsBound = false;
  let lastVariantSignature = "";
  let userPickedVariant = false;

  function initVariants() {
    if (!variantsTarget) return;

    heroItem = pickHeroItem();
    if (!heroItem) {
      variantsTarget.hidden = true;
      console.warn("[variantes] no hay ningún .cms-product-item en el DOM.");
      return;
    }

    siblings = collectSiblings(heroItem);
    const signature = siblings.map((el) => (el.getAttribute("data-sku") || "").trim()).join("|");
    if (lastVariantSignature && signature === lastVariantSignature) return;
    lastVariantSignature = signature;

    sharedVideoSrc = [];
    sharedVideoPoster = "";
    const videoOwner =
      [heroItem, ...siblings].find(
        (el) => parseList(el.getAttribute("data-video") || el.getAttribute("data-videos") || "").length
      ) || null;
    if (videoOwner) {
      sharedVideoSrc = parseList(videoOwner.getAttribute("data-video") || videoOwner.getAttribute("data-videos") || "");
      sharedVideoPoster = resolveVideoPoster(videoOwner, sharedVideoSrc, videoOwner.getAttribute("data-image") || "");
    }

    siblings.forEach((el) => {
      const videos = parseList(
        el.getAttribute("data-videos") || el.getAttribute("data-video")
      );
      const poster = resolveVideoPoster(
        el,
        videos,
        el.getAttribute("data-image") || ""
      );
      const media = [
        ...parseList(el.getAttribute("data-multiimage")),
        ...videos,
      ];
      media.forEach((src) => {
        if (!src || detectMediaType(src) !== "image") return;
        const img = new Image();
        img.src = src;
      });
      if (poster) {
        const img = new Image();
        img.src = poster;
      }
    });

    dimensionKeys = resolveDimensions(heroItem, siblings);

    console.log("[variantes]", {
      hero: (heroItem.getAttribute("data-sku") || "").trim(),
      hermanas: siblings.length,
      skus: siblings.map((el) => (el.getAttribute("data-sku") || "").trim()),
      atributoDeclarado: (heroItem.getAttribute("data-nombre-attr-variantes") || "").trim() || "(vacío)",
      dimension: dimensionKeys[0] || "(fallback por nombre/SKU)",
    });

    if (siblings.length <= 1) {
      variantsTarget.hidden = true;
      console.warn(
        "[variantes] solo se encontró el producto actual. Falta la Collection List atada a " +
          "Variantes_Multireference: cada item tiene que imprimir un .cms-product-item con data-variant-item. " +
          "Ver variantes-embed.html."
      );
      applyProduct(heroItem, { skipHistory: true });
      return;
    }

    applyProduct(heroItem, { skipHistory: true });

    if (variantsBound) return;
    variantsBound = true;

    variantsTarget.addEventListener("change", (e) => {
      const input = e.target;
      if (!input.classList || !input.classList.contains("variant-chip-radio")) return;
      const match = findMatchForInput(input);
      if (!match) return;
      userPickedVariant = true;
      applyProduct(match);
    });

    window.addEventListener("popstate", () => {
      const slug = (location.pathname || "").replace(/^\//, "");
      const match =
        siblings.find((el) => {
          const link = (el.getAttribute("data-link") || el.getAttribute("data-product-url") || "").replace(/^\//, "");
          return link === slug;
        }) ||
        siblings.find((el) => (el.getAttribute("data-sku") || "") === (history.state && history.state.sku));
      if (match) applyProduct(match, { skipHistory: true });
    });
  }

  /* —— AI assistant —— */
  const CONTACTO_URL = "https://macroled.com.ar/contacto"; // TODO: reemplazar por la URL real de contacto

  const PRODUCT_CTX = (window.__mlProductCtx = {
    name: "Space Blanca",
    sku: "SPACE-B",
    voltage: "DC 5V",
    power: "1.6W",
    warranty: "1 año",
    ficha: "https://s3.coresagroup.com/MACROLED/DS/SPACE-B.pdf",
    manual: "https://s3.coresagroup.com/MACROLED/Garantias/SPACE-B.pdf",
    specs: {},
    contactoUrl: CONTACTO_URL,
  });


  /**
   * Mensaje de fallback de la Capa 2 (se lo pasamos al motor genérico como
   * "fallbackHtml"). Se usa SOLO cuando la IA no pudo responder por un
   * problema técnico (timeout, red caída, webhook no disponible todavía) —
   * no es un "no sé la respuesta". Por eso invita a revisar la ficha técnica
   * en vez de mandar directo a contacto: ese salto a contacto queda
   * reservado para precio/stock, o para lo que el propio agente decida
   * cuando esté conectado de verdad.
   */
  function noDataFallbackMsg() {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    if (ctx.ficha) {
      return `No pude encontrar información sobre esa característica para este producto. Te recomendamos revisar la <a href="${ctx.ficha}" target="_blank" rel="noopener">ficha técnica (PDF)</a>, donde puede estar especificada con mayor detalle.`;
    }
    return `No pude encontrar información sobre esa característica para este producto.`;
  }

  /* —— Motor del asistente ——
     Mismo webhook y parseo que productos. Todas las preguntas van a la IA;
     el payload incluye el SKU de la ficha que el usuario está viendo. */
  const N8N_WEBHOOK_URL = "https://n8n.coresagroup.com/webhook/macroled-ia";
  const AI_TIMEOUT_MS = 12000;

  function newSessionId() {
    return window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  window.MacroledSessionId = window.MacroledSessionId || newSessionId();

  function defaultFallbackHtml() {
    return "No pude encontrar información sobre esa consulta en este momento.";
  }

  function initAssistant(options) {
    options = options || {};
    const getPayload = typeof options.getPayload === "function" ? options.getPayload : (q) => ({ pregunta: q });
    const getSuggestions = typeof options.suggestions === "function" ? options.suggestions : () => [];
    const fallbackHtml = typeof options.fallbackHtml === "function" ? options.fallbackHtml : defaultFallbackHtml;
    const greeting = options.greeting || "Hola, soy el asistente de <b>productos Macroled</b>.";

    const aiLaunch = document.getElementById("aiLaunch");
    const aiPanel = document.getElementById("aiPanel");
    const aiBackdrop = document.getElementById("aiBackdrop");
    const aiMessages = document.getElementById("aiMessages");
    const aiTyping = document.getElementById("aiTyping");
    const aiSuggestions = document.getElementById("aiSuggestions");
    const aiForm = document.getElementById("aiForm");
    const aiInput = document.getElementById("aiInput");
    const aiClose = document.getElementById("aiClose");
    const openFromCta = document.getElementById("openAssistantFromCta"); // opcional, solo en ficha

    if (!aiPanel || !aiForm || !aiMessages) {
      console.warn("[asistente] Faltan elementos del widget en el DOM de esta página — no se inicializa.");
      return null;
    }

    let aiBusy = false;
    let aiLastTrigger = null;
    const usedSuggestions = new Set();
    let askedCount = 0;

    function openAssistant(trigger) {
      aiLastTrigger = trigger || document.activeElement;
      if (aiBackdrop) {
        aiBackdrop.hidden = false;
        aiBackdrop.removeAttribute("hidden");
      }
      aiPanel.hidden = false;
      aiPanel.removeAttribute("hidden");
      // Doble rAF para que el browser pinte el estado cerrado antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          aiPanel.classList.add("is-open");
          if (aiBackdrop) aiBackdrop.classList.add("is-open");
        });
      });
      document.body.classList.add("assistant-open");
      try {
        const isTouchUi =
          window.matchMedia("(max-width: 640px)").matches ||
          window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (aiInput) {
          if (isTouchUi) aiInput.blur();
          else aiInput.focus();
        }
      } catch (_) {}
    }

    function closeAssistant() {
      aiPanel.classList.remove("is-open");
      if (aiBackdrop) aiBackdrop.classList.remove("is-open");
      document.body.classList.remove("assistant-open");
      setTimeout(() => {
        aiPanel.hidden = true;
        if (aiBackdrop) aiBackdrop.hidden = true;
        if (aiLastTrigger && typeof aiLastTrigger.focus === "function") aiLastTrigger.focus();
      }, 280);
    }

    function linkifyHtml(html) {
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      function walk(node) {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const re = /\b((?:https?:\/\/|www\.)[^\s<]+)/gi;
          if (!re.test(text)) return;
          re.lastIndex = 0;
          const frag = document.createDocumentFragment();
          let last = 0;
          let match;
          while ((match = re.exec(text))) {
            if (match.index > last) {
              frag.appendChild(document.createTextNode(text.slice(last, match.index)));
            }
            let raw = match[1];
            const punct = raw.match(/[),.;:!?]+$/);
            let hrefSrc = raw;
            let extra = "";
            if (punct) {
              hrefSrc = raw.slice(0, -punct[0].length);
              extra = punct[0];
            }
            const a = document.createElement("a");
            a.href = /^https?:\/\//i.test(hrefSrc) ? hrefSrc : "https://" + hrefSrc;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = hrefSrc;
            frag.appendChild(a);
            if (extra) frag.appendChild(document.createTextNode(extra));
            last = match.index + raw.length;
          }
          if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          if (node.tagName === "A") {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "noopener noreferrer");
            return;
          }
          Array.prototype.slice.call(node.childNodes).forEach(walk);
        }
      }
      Array.prototype.slice.call(wrap.childNodes).forEach(walk);
      return wrap.innerHTML;
    }

    function addMsg(role, html) {
      const el = document.createElement("div");
      el.className = `ai-msg ${role}`;
      el.innerHTML = `<div class="ai-bubble">${role === "bot" ? linkifyHtml(html) : html}</div>`;
      aiMessages.appendChild(el);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function renderSuggestions() {
      if (!aiSuggestions) return;
      if (askedCount >= 2) {
        aiSuggestions.innerHTML = "";
        return;
      }
      aiSuggestions.innerHTML = getSuggestions()
        .filter((s) => !usedSuggestions.has(s))
        .map((s) => `<button type="button" class="ai-chip">${s}</button>`)
        .join("");
    }

    async function askAI(question) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      try {
        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            ...getPayload(question),
            sessionId: window.MacroledSessionId,
          }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        // El "Respond to Webhook" de n8n a veces envuelve el resultado en
        // un array de 1 item ([{ respuesta: "..." }]) y a veces manda el
        // objeto suelto ({ respuesta: "..." }) — aceptamos las dos formas.
        const item = Array.isArray(data) ? data[0] : data;
        if (item && item.resetSession) window.MacroledSessionId = newSessionId();
        const texto = item && (item.respuesta || item.output || item.answer);
        if (!texto) throw new Error("Respuesta vacía del agente");

        // El \n del agente -> <br> para que se vea bien en el chat
        return String(texto).replace(/\n/g, "<br>");
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("[asistente] error consultando IA:", err);
        return fallbackHtml();
      }
    }

    /**
     * Todas las preguntas van al agente. El SKU de la ficha viaja en el payload.
     */
    async function ask(question) {
      const q = question.trim();
      if (!q || aiBusy) return;
      aiBusy = true;
      if (getSuggestions().includes(q)) usedSuggestions.add(q);
      askedCount += 1;
      if (aiSuggestions) aiSuggestions.innerHTML = "";
      addMsg("user", q.replace(/</g, "&lt;"));
      aiTyping.classList.add("is-on");
      aiForm.querySelector(".ai-send").disabled = true;

      const respuesta = await askAI(q);

      aiTyping.classList.remove("is-on");
      addMsg("bot", respuesta);
      renderSuggestions();
      aiForm.querySelector(".ai-send").disabled = false;
      aiBusy = false;
    }

    if (aiLaunch) aiLaunch.addEventListener("click", (e) => openAssistant(e.currentTarget));
    if (openFromCta) openFromCta.addEventListener("click", (e) => openAssistant(e.currentTarget));
    if (aiClose) aiClose.addEventListener("click", closeAssistant);
    if (aiBackdrop) aiBackdrop.addEventListener("click", closeAssistant);

    if (aiSuggestions) {
      aiSuggestions.addEventListener("click", (e) => {
        const chip = e.target.closest(".ai-chip");
        if (chip) ask(chip.textContent);
      });
    }
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = aiInput.value;
      aiInput.value = "";
      ask(q);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aiPanel.classList.contains("is-open")) closeAssistant();
    });

    addMsg("bot", greeting);
    renderSuggestions();

    window.MacroledAssistantOpen = openAssistant;
    return { openAssistant, closeAssistant, renderSuggestions, ask };
  }

  /* Webflow pisa button/label con width:100% / display:block; forzamos la fila en runtime. */
  function hardenCtaUtility() {
    const row = document.querySelector(".cta-utility");
    if (!row) return;
    row.style.setProperty("display", "grid", "important");
    row.style.setProperty("grid-template-columns", "minmax(0,1fr) auto", "important");
    row.style.setProperty("align-items", "center", "important");
    row.style.setProperty("width", "100%", "important");
    row.style.setProperty("column-gap", "12px", "important");
    const compare = row.querySelector(".compare-row");
    const ask = row.querySelector(".btn-ai");
    if (compare) {
      compare.style.setProperty("display", "inline-flex", "important");
      compare.style.setProperty("width", "auto", "important");
      compare.style.setProperty("justify-self", "start", "important");
      compare.style.setProperty("float", "none", "important");
    }
    if (ask) {
      ask.style.setProperty("display", "inline-flex", "important");
      ask.style.setProperty("width", "auto", "important");
      ask.style.setProperty("justify-self", "end", "important");
      ask.style.setProperty("margin", "0", "important");
      ask.style.setProperty("border", "none", "important");
      ask.style.setProperty("background", "transparent", "important");
      ask.style.setProperty("white-space", "nowrap", "important");
      ask.style.setProperty("float", "none", "important");
    }
  }
  hardenCtaUtility();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hardenCtaUtility);
  }
  window.addEventListener("load", hardenCtaUtility);

  function getFichaPayload(question) {
    const ctx = window.__mlProductCtx || PRODUCT_CTX || {};
    const skuFromDom = (document.getElementById("ficha-sku") || {}).textContent || "";
    return {
      pregunta: question,
      contexto: "ficha",
      sku: String(ctx.sku || skuFromDom).trim(),
      nombre: String(ctx.name || "").trim(),
    };
  }

  const assistant = initAssistant({
    greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Preguntame por un producto, SKU o característica y te ayudo a encontrarlo.`,
    getPayload: getFichaPayload,
    fallbackHtml: noDataFallbackMsg,
  });

  /* —— Share —— */
  const shareBtn = document.getElementById("shareBtn");
  const shareMenu = document.getElementById("shareMenu");
  const shareSheet = document.getElementById("shareSheet");
  const shareSheetBackdrop = document.getElementById("shareSheetBackdrop");
  const shareSheetClose = document.getElementById("shareSheetClose");
  const shareSheetNative = document.getElementById("shareSheetNative");
  const shareToast = document.getElementById("shareToast");
  const shareNativeOpt = document.getElementById("shareNativeOpt");
  const canNativeShare = typeof navigator.share === "function";
  const mqShareMobile = window.matchMedia("(max-width: 640px)");
  let shareOpen = false;

  function sharePayload() {
    const sku = (document.getElementById("ficha-sku") || {}).textContent || "SPACE-B";
    const title = document.querySelector(".info h1")?.textContent?.trim() || "Producto Macroled";
    const url = location.href.split("#")[0];
    const text = `${title} (${sku.trim()}) — Macroled`;
    return { title, text, url };
  }

  function setShareLinks() {
    const { title, text, url } = sharePayload();
    const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    document.querySelectorAll('[data-share="whatsapp"]').forEach((el) => {
      if (el.tagName === "A") el.href = wa;
    });
    document.querySelectorAll('[data-share="linkedin"]').forEach((el) => {
      if (el.tagName === "A") el.href = li;
    });
    document.querySelectorAll('[data-share="email"]').forEach((el) => {
      if (el.tagName === "A") el.href = mail;
    });
  }

  function isShareSheetOpen() {
    return !!(shareSheet && shareSheet.classList.contains("is-open"));
  }

  function openShareSheet() {
    if (!shareSheet) return;
    setShareLinks();
    if (canNativeShare && shareSheetNative) shareSheetNative.hidden = false;
    shareSheet.hidden = false;
    document.body.classList.add("share-sheet-open");
    requestAnimationFrame(() => {
      shareSheet.classList.add("is-open");
    });
    shareOpen = true;
    if (shareBtn) shareBtn.setAttribute("aria-expanded", "true");
    if (openLightboxBtn) openLightboxBtn.setAttribute("aria-expanded", "true");
  }

  function closeShareSheet() {
    if (!shareSheet) return;
    shareSheet.classList.remove("is-open");
    document.body.classList.remove("share-sheet-open");
    const finish = () => {
      if (!shareSheet.classList.contains("is-open")) shareSheet.hidden = true;
    };
    shareSheet.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 360);
    shareOpen = false;
    if (shareBtn) shareBtn.setAttribute("aria-expanded", "false");
    if (openLightboxBtn) openLightboxBtn.setAttribute("aria-expanded", "false");
  }

  function openShareMenu() {
    setShareLinks();
    if (mqShareMobile.matches) {
      openShareSheet();
      return;
    }
    if (canNativeShare && shareNativeOpt) shareNativeOpt.hidden = false;
    if (shareMenu) shareMenu.hidden = false;
    shareOpen = true;
    if (shareBtn) shareBtn.setAttribute("aria-expanded", "true");
  }

  function closeShareMenu() {
    if (mqShareMobile.matches || isShareSheetOpen()) {
      closeShareSheet();
      return;
    }
    if (shareMenu) shareMenu.hidden = true;
    shareOpen = false;
    if (shareBtn) shareBtn.setAttribute("aria-expanded", "false");
    if (openLightboxBtn) openLightboxBtn.setAttribute("aria-expanded", "false");
  }

  function toggleShareFromStage() {
    if (isShareSheetOpen() || (shareOpen && mqShareMobile.matches)) {
      closeShareMenu();
      return;
    }
    openShareMenu();
  }
  window.__mlToggleShareFromStage = toggleShareFromStage;

  function showShareToast(msg) {
    shareToast.textContent = msg;
    shareToast.classList.add("is-on");
    clearTimeout(showShareToast._t);
    showShareToast._t = setTimeout(() => shareToast.classList.remove("is-on"), 2200);
  }

  async function copyShareLink() {
    const { url } = sharePayload();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showShareToast("Link copiado");
  }

  async function nativeShare() {
    const p = sharePayload();
    try {
      await navigator.share({ title: p.title, text: p.text, url: p.url });
    } catch (err) {
      if (err && err.name !== "AbortError") copyShareLink();
    }
  }

  async function handleShareAction(e) {
    const opt = e.target.closest("[data-share]");
    if (!opt) return;
    const type = opt.getAttribute("data-share");
    if (type === "copy") {
      e.preventDefault();
      await copyShareLink();
      closeShareMenu();
    } else if (type === "native") {
      e.preventDefault();
      closeShareMenu();
      await nativeShare();
    } else {
      /* links externos: cerrar después del tap */
      closeShareMenu();
    }
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (shareOpen || isShareSheetOpen() || (shareMenu && !shareMenu.hidden)) closeShareMenu();
      else openShareMenu();
    });
  }
  if (shareMenu) shareMenu.addEventListener("click", handleShareAction);
  if (shareSheet) shareSheet.addEventListener("click", handleShareAction);
  if (shareSheetBackdrop) {
    shareSheetBackdrop.addEventListener("click", (e) => {
      e.preventDefault();
      closeShareMenu();
    });
  }
  if (shareSheetClose) {
    shareSheetClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeShareMenu();
    });
  }
  document.addEventListener("click", (e) => {
    if (mqShareMobile.matches) return;
    if (!shareMenu || shareMenu.hidden) return;
    if (e.target.closest(".share-wrap")) return;
    if (e.target.closest(".share-menu")) return;
    closeShareMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (shareOpen || isShareSheetOpen() || (shareMenu && !shareMenu.hidden))) {
      closeShareMenu();
    }
  });
  mqShareMobile.addEventListener?.("change", () => {
    if (!mqShareMobile.matches && isShareSheetOpen()) closeShareSheet();
    if (mqShareMobile.matches && shareMenu && !shareMenu.hidden) {
      shareMenu.hidden = true;
      openShareSheet();
    }
  });

  /* Scroll / entrance reveals */
  function initReveals() {
    const nodes = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach((el) => io.observe(el));
  }

  /**
   * En Webflow el Custom Code a veces corre ANTES del Embed CMS.
   * Esperamos a que exista .cms-product-item (o al DOM listo) y reintentamos.
   */
  /**
   * La Collection List de variantes puede montarse después del embed del héroe,
   * así que seguimos mirando si aparecen más .cms-product-item.
   */
  function watchForLateVariants() {
    let lastCount = document.querySelectorAll(".cms-product-item").length;
    let checks = 0;
    const tick = () => {
      if (userPickedVariant) return;
      const count = document.querySelectorAll(".cms-product-item").length;
      if (count !== lastCount) {
        lastCount = count;
        initVariants();
      }
      checks += 1;
      if (checks < 50) setTimeout(tick, 200); /* ~10s */
    };
    setTimeout(tick, 200);
  }

  /**
   * Hasta acá el nombre/SKU/EAN/specs visibles eran el placeholder estático
   * del HTML. initVariants() ya corrió (sync) y aplicó el producto real si
   * lo encontró, así que revelar ahora no deja ver el placeholder viejo.
   * Si el embed CMS nunca aparece, esto también se ejecuta (bootFicha corre
   * igual tras el timeout de waitForCmsAndBoot) para no dejar la ficha oculta.
   */
  function revealFicha() {
    const wrap = document.querySelector(".wrap.is-hydrating");
    if (wrap) wrap.classList.remove("is-hydrating");
  }

  function bootFicha() {
    hardenCtaUtility();
    initVariants();
    watchForLateVariants();
    initReveals();
    revealFicha();
  }

  function waitForCmsAndBoot() {
    let tries = 0;
    const maxTries = 40; /* ~4s */
    const tick = () => {
      const hasCms = !!document.querySelector(".cms-product-item");
      if (hasCms || tries >= maxTries) {
        bootFicha();
        return;
      }
      tries += 1;
      setTimeout(tick, 100);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tick);
    } else {
      tick();
    }
  }

  waitForCmsAndBoot();
  /* Red de seguridad: si por lo que sea bootFicha tarda de más, no dejamos
     la ficha oculta más de 1.2s (peor caso normal: el embed CMS ya está en
     el DOM y esto ni se nota, revealFicha ya corrió antes). */
  setTimeout(revealFicha, 1200);
})();
