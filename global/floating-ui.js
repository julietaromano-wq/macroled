/* Monta los flotantes fuera de los embeds de Webflow y los detiene antes del footer. */
(function () {
  "use strict";

  function initFloatingUi() {
    var launch = document.getElementById("aiLaunch");
    var bar = document.getElementById("compareBar");
    var reference = launch || bar;
    if (!reference || document.documentElement.dataset.floatingUiBound === "1") return;
    document.documentElement.dataset.floatingUiBound = "1";

    var boundary = document.querySelector("[data-floating-boundary], [data-compare-boundary], #productos-relacionados");
    if (!boundary) boundary = reference.closest("#macroled-productos, #macroled-home, #layout, main");
    if (!boundary) boundary = document.querySelector("#macroled-productos, #macroled-home, #layout, main");

    [bar, launch, document.getElementById("aiBackdrop"), document.getElementById("aiPanel")].forEach(function (element) {
      if (element && element.parentElement !== document.body) document.body.appendChild(element);
    });

    var frame = 0;
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
      var stopTop = null;
      if (boundary && boundary.isConnected && boundary.getClientRects().length) {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFloatingUi, { once: true });
  } else {
    initFloatingUi();
  }
})();
