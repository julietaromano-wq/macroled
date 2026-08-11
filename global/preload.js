/* preload.js — oculta el overlay cuando la página / Typesense terminó de renderizar.
   Uso:
     <html class="ml-loading" data-ml-preload="typesense|dom">
     ...
     window.MacroledPreload.done();  // en páginas typesense, tras el primer render

   Flujo visual:
     1) el logo se rellena de gris → #0077a8 hasta 100%
     2) si la página todavía no está lista, el logo completo titila
     3) al llamar done(), se oculta el overlay
*/
(function () {
  "use strict";

  var CRITICAL_CSS =
    "html.ml-loading,html.ml-loading body{background:#f5f5f5!important}" +
    "html.ml-loading body{overflow:hidden}" +
    "html.ml-loading body>*:not(#ml-preload){opacity:0!important;pointer-events:none!important}" +
    "#ml-preload{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#f5f5f5;transition:opacity .4s ease,visibility .4s ease}" +
    "#ml-preload.is-done{opacity:0;visibility:hidden;pointer-events:none}" +
    ".ml-preload__inner{display:flex;flex-direction:column;align-items:center;padding:24px;width:min(280px,78vw);box-sizing:border-box}" +
    ".ml-preload__logo-wrap{position:relative;width:100%;max-width:220px;line-height:0}" +
    ".ml-preload__logo{width:100%;height:auto;display:block}" +
    ".ml-preload__logo--base{color:#d5dbe2}" +
    ".ml-preload__logo--fill{position:absolute;left:0;top:0;width:100%;height:auto;color:#0077a8;clip-path:inset(0 calc((1 - var(--ml-fill, 0)) * 100%) 0 0)}" +
    "#ml-preload.is-waiting .ml-preload__logo-wrap{animation:ml-preload-pulse 1.05s ease-in-out infinite}" +
    "@keyframes ml-preload-pulse{0%,100%{opacity:1}50%{opacity:.42}}";

  var LOGO_PATH =
    'd="M191.2,54.17c.37.59.26,1.35-.24,1.83-6.06,5.7-13.78,8.8-22.14,8.8-9.29,0-16.97-3.01-23.47-9.19-6.48-6.25-9.64-13.83-9.64-23.17,0-8.64,3.87-17.61,9.64-23.17C151.84,3.09,159.52.09,168.81.09c8.11,0,15.61,2.91,21.58,8.28.52.47.64,1.24.27,1.84l-6.34,10.34-.23-.25c-4.04-4.65-9.18-7.01-15.28-7.01-5.37,0-9.8,1.77-13.55,5.42-3.63,3.71-5.4,8.2-5.4,13.74s1.77,10.03,5.4,13.74c3.74,3.64,8.18,5.42,13.55,5.42,10.61,0,15.98-7.77,15.98-7.77l6.41,10.34ZM110.4,1.2l25.62,62.61h-15.25l-2.45-6.17s-.02-.05-.03-.08c-1.41-3.46-4.2-4.18-7.58-4.18h-19.27l-4.15,10.42h-15.24L96.36,4.35c.84-2.04,2.82-3.37,5.03-3.37h8.92l.09.22ZM112.45,41.71l-7.71-19.52c-.24-.61-1.11-.61-1.35,0l-7.79,19.52h16.85ZM51.21,4.22l-17.78,27.35c-.29.44-.93.44-1.21,0L14.44,4.22c-1.34-2.02-3.61-3.24-6.03-3.24H0v62.84h13.42V29.13c0-.71.93-1,1.32-.4l17.48,26.01c.29.43.92.43,1.2,0l17.39-25.99c.4-.59,1.32-.31,1.32.4v34.67h13.51V.98h-8.41c-2.43,0-4.69,1.22-6.03,3.24ZM387.61,49.9v-11.77h23.06v-13.05h-22.34c-.4,0-.72-.32-.72-.72v-10.16h22.38c3,0,5.43-2.43,5.43-5.43V.98h-42.11v62.84h43.33v-13.2h-28.3c-.4,0-.72-.33-.72-.72ZM341.28,49.53V6.41c0-3-2.43-5.43-5.43-5.43h-9.15v62.84h38.3v-13.56h-23c-.4,0-.72-.33-.72-.72ZM236.17,40.33l15.42,23.49h-13.54c-1.88,0-3.63-.97-4.62-2.57l-11.2-18.11h-8.53v20.67h-14.21V.98h26.12c5.86,0,10.9,2.04,14.98,6.07,4.23,4,6.28,8.83,6.28,14.78,0,7.57-4.28,14.29-10.44,17.47-.37.19-.5.67-.27,1.02ZM232.58,22.02c0-4.47-3.15-7.84-7.32-7.84h-11.55v15.4c0,.4.32.72.72.72h9.68c5.14,0,8.46-3.25,8.46-8.28ZM482.06,32.53c0,9.47-2.88,17.14-8.57,22.8-5.57,5.63-13.76,8.48-24.34,8.48h-23.02V.98h22.93c10.49,0,18.68,2.94,24.34,8.75,5.75,5.71,8.66,13.39,8.66,22.8ZM467.67,32.53c0-5.73-1.48-10.27-4.4-13.48-2.86-3.24-7.93-4.87-15.09-4.87h-7.74v35.71c0,.4.32.72.73.72h7.1c13.24,0,19.41-5.75,19.41-18.09ZM309.06,9.46c6.39,6.25,9.63,14.01,9.63,23.07s-3.21,16.88-9.54,23.16c-6.36,6.22-14.2,9.37-23.31,9.37s-16.86-3.15-23.3-9.37c-6.34-6.29-9.55-14.08-9.55-23.17s3.21-16.8,9.54-23.07c6.42-6.28,14.26-9.46,23.31-9.46s16.89,3.18,23.22,9.46ZM304.34,32.53c0-5.26-1.8-9.81-5.35-13.51-3.57-3.73-8-5.63-13.15-5.63s-9.58,1.9-13.15,5.63c-3.55,3.71-5.35,8.25-5.35,13.51s1.75,9.93,5.35,13.69c3.54,3.62,7.97,5.45,13.15,5.45s9.5-1.81,13.06-5.54c3.61-3.68,5.43-8.25,5.43-13.6Z"';

  function logoSvg(extraClass) {
    return (
      '<svg class="ml-preload__logo ' + extraClass + '" viewBox="0 0 482.06 65.07" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path fill="currentColor" ' + LOGO_PATH + "></path>" +
      "</svg>"
    );
  }

  var INNER_HTML =
    '<div class="ml-preload__inner">' +
      '<div class="ml-preload__logo-wrap">' +
        logoSvg("ml-preload__logo--base") +
        logoSvg("ml-preload__logo--fill") +
      "</div>" +
    "</div>";

  var finished = false;
  var SAFETY_MS = 10000;
  var fill = 0;
  var fillRaf = 0;
  var fillStartedAt = 0;
  var completing = false;
  var waiting = false;

  // Rellena completo en ~2.2s; si Typesense tarda más, titila
  var IDLE_FILL_MS = 2200;
  var COMPLETE_MIN_MS = 160;
  var COMPLETE_MAX_MS = 380;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function preloadEl() {
    return document.getElementById("ml-preload");
  }

  function setFill(value) {
    fill = Math.max(0, Math.min(1, value));
    var el = preloadEl();
    if (el) el.style.setProperty("--ml-fill", String(fill));
  }

  function startWaitingPulse() {
    if (waiting || finished) return;
    waiting = true;
    var el = preloadEl();
    if (el) el.classList.add("is-waiting");
  }

  function stopWaitingPulse() {
    waiting = false;
    var el = preloadEl();
    if (el) el.classList.remove("is-waiting");
  }

  function injectCriticalCss() {
    if (document.getElementById("ml-preload-critical")) return;
    var style = document.createElement("style");
    style.id = "ml-preload-critical";
    style.textContent = CRITICAL_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureMarkup() {
    var el = preloadEl();
    if (!el) {
      el = document.createElement("div");
      el.id = "ml-preload";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-busy", "true");
      el.setAttribute("aria-label", "Cargando Macroled");
      var parent = document.body || document.documentElement;
      if (parent.firstChild) parent.insertBefore(el, parent.firstChild);
      else parent.appendChild(el);
    }
    el.innerHTML = INNER_HTML;
    setFill(fill);
  }

  function tickIdleFill(now) {
    if (finished || completing) return;
    var t = Math.min(1, (now - fillStartedAt) / IDLE_FILL_MS);
    setFill(easeOutCubic(t));
    if (t < 1) {
      fillRaf = requestAnimationFrame(tickIdleFill);
    } else {
      // Logo completo: titila hasta que la página avise que terminó
      startWaitingPulse();
    }
  }

  function startIdleFill() {
    fillStartedAt = performance.now();
    if (fillRaf) cancelAnimationFrame(fillRaf);
    fillRaf = requestAnimationFrame(tickIdleFill);
  }

  function completeFill(onComplete) {
    completing = true;
    if (fillRaf) cancelAnimationFrame(fillRaf);

    if (fill >= 0.995) {
      setFill(1);
      if (onComplete) onComplete();
      return;
    }

    var from = fill;
    var remaining = 1 - from;
    var duration = COMPLETE_MIN_MS + remaining * (COMPLETE_MAX_MS - COMPLETE_MIN_MS);
    var start = performance.now();

    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      setFill(from + remaining * easeOutCubic(t));
      if (t < 1) {
        fillRaf = requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete();
      }
    }

    fillRaf = requestAnimationFrame(tick);
  }

  function hideOverlay() {
    var html = document.documentElement;
    var el = preloadEl();
    stopWaitingPulse();
    html.classList.remove("ml-loading");
    html.classList.add("ml-ready");
    if (!el) return;
    el.setAttribute("aria-busy", "false");
    el.classList.add("is-done");
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 420);
  }

  function done() {
    if (finished) return;
    finished = true;
    stopWaitingPulse();
    completeFill(hideOverlay);
  }

  function boot() {
    document.documentElement.classList.add("ml-loading");
    ensureMarkup();
    startIdleFill();

    var mode = (document.documentElement.getAttribute("data-ml-preload") || "dom").toLowerCase();
    if (mode === "dom") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", done);
      } else {
        done();
      }
    }

    setTimeout(done, SAFETY_MS);
  }

  injectCriticalCss();
  document.documentElement.classList.add("ml-loading");

  window.MacroledPreload = {
    done: done,
    isDone: function () { return finished; }
  };

  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
