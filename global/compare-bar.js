/* Anclaje global de la barra comparativa para embeds dentro de Webflow. */
(function () {
  "use strict";

  function initCompareBarAnchor() {
    var bar = document.getElementById("compareBar");
    if (!bar || bar.dataset.compareAnchorBound === "1") return;
    bar.dataset.compareAnchorBound = "1";

  // Se toma el límite antes de portar la barra a body. data-compare-boundary
  // permite definir uno explícito; los fallbacks cubren Productos y fichas.
    var boundary = bar.closest("[data-compare-boundary], #macroled-productos, main");
    if (!boundary) boundary = document.querySelector("[data-compare-boundary], #macroled-productos, main");

    if (bar.parentElement !== document.body) document.body.appendChild(bar);

    var frame = 0;
    function updatePosition() {
      frame = 0;
      if (!boundary || !boundary.isConnected) {
        bar.style.setProperty("--compare-bar-lift", "0px");
        return;
      }
      var lift = Math.max(0, window.innerHeight - boundary.getBoundingClientRect().bottom);
      bar.style.setProperty("--compare-bar-lift", lift + "px");
    }

    function schedulePosition() {
      if (frame) return;
      frame = requestAnimationFrame(updatePosition);
    }

    window.addEventListener("scroll", schedulePosition, { passive: true });
    window.addEventListener("resize", schedulePosition);

    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(schedulePosition);
      if (boundary) observer.observe(boundary);
      observer.observe(bar);
    }

    schedulePosition();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCompareBarAnchor, { once: true });
  } else {
    initCompareBarAnchor();
  }
})();
