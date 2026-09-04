/* Monta los flotantes fuera de los embeds de Webflow y los detiene antes del footer. */
(function () {
  "use strict";

  function initFloatingUi() {
    var launch = document.getElementById("aiLaunch");
    var bar = document.getElementById("compareBar");
    var reference = launch || bar;
    if (!reference || document.documentElement.dataset.floatingUiBound === "1") return false;
    document.documentElement.dataset.floatingUiBound = "1";

    var related = document.getElementById("productos-relacionados");
    var boundary = related ||
      document.getElementById("macroled-productos") ||
      document.getElementById("macroled-home") ||
      document.getElementById("layout") ||
      document.querySelector("[data-floating-boundary], [data-compare-boundary], main");

    [bar, launch, document.getElementById("aiBackdrop"), document.getElementById("aiPanel")].forEach(function (element) {
      if (element && element.parentElement !== document.body) document.body.appendChild(element);
    });

    var frame = 0;
    var relatedBaseMargin = related ? (parseFloat(getComputedStyle(related).marginBottom) || 0) : 0;
    function getFooterTop() {
      var nodes = document.querySelectorAll("[data-floating-footer], footer, [class*='footer'], [id*='footer']");
      var top = null;
      nodes.forEach(function (node) {
        var rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        if (top === null || rect.top < top) top = rect.top;
      });
      return top;
    }

    function updatePosition() {
      frame = 0;
      var barVisible = bar && getComputedStyle(bar).display !== "none";
      var barReserve = barVisible ? bar.getBoundingClientRect().height + 16 : 0;
      if (related) related.style.marginBottom = (relatedBaseMargin + barReserve) + "px";

      var stopTop = null;
      /* En Ficha, el espacio reservado después de relacionados hace que el
         footer sea el límite correcto. En el resto se usa el contenedor local. */
      if (related) stopTop = getFooterTop();
      if (stopTop === null && boundary && boundary.isConnected && boundary.getClientRects().length) {
        stopTop = boundary.getBoundingClientRect().bottom;
      }
      if (stopTop === null) stopTop = getFooterTop();

      var lift = stopTop === null ? 0 : Math.max(0, window.innerHeight - stopTop);
      if (launch) launch.style.setProperty("--floating-ui-lift", lift + "px");
      if (bar) bar.style.setProperty("--compare-bar-lift", lift + "px");
    }

    function schedulePosition() {
      if (!frame) frame = requestAnimationFrame(updatePosition);
    }

    window.addEventListener("scroll", schedulePosition, { passive: true });
    window.addEventListener("resize", schedulePosition);
    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(schedulePosition);
      if (boundary) observer.observe(boundary);
      if (launch) observer.observe(launch);
      if (bar) observer.observe(bar);
      document.querySelectorAll("[data-floating-footer], footer, [class*='footer'], [id*='footer']").forEach(function (node) {
        observer.observe(node);
      });
    }
    schedulePosition();
    return true;
  }

  function bootFloatingUi() {
    if (initFloatingUi()) return;
    /* Algunos Code Embeds de Webflow se insertan después del primer intento. */
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      if (initFloatingUi()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootFloatingUi, { once: true });
  } else {
    bootFloatingUi();
  }
})();
