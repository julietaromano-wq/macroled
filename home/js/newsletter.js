(function () {
  "use strict";

  const DEFAULT_ENDPOINT = "/api/newsletter-macroled";

  function initNewsletter() {
    const popup = document.getElementById("nlPopup");
    const backdrop = document.getElementById("nlBackdrop");
    const form = document.getElementById("nlForm");
    const closeBtn = document.getElementById("nlClose");
    const success = document.getElementById("nlSuccess");
    const errorEl = document.getElementById("nlError");
    const submitBtn = form ? form.querySelector(".nl-submit") : null;
    const interestTabs = form ? form.querySelector("[data-interest-tabs]") : null;

    if (!popup || !form) return;

    let lastTrigger = null;
    let submitting = false;

    const getSelectedInterests = () => {
      if (!interestTabs) return [];
      return Array.prototype.map
        .call(interestTabs.querySelectorAll('.nl-interest-tab[aria-pressed="true"]'), tab => tab.dataset.interest)
        .filter(Boolean);
    };

    const clearInterestTabs = () => {
      if (!interestTabs) return;
      interestTabs.querySelectorAll(".nl-interest-tab").forEach(tab => {
        tab.setAttribute("aria-pressed", "false");
        tab.classList.remove("is-active");
      });
    };

    if (interestTabs) {
      interestTabs.addEventListener("click", event => {
        const tab = event.target.closest(".nl-interest-tab");
        if (!tab || !interestTabs.contains(tab)) return;

        const next = tab.getAttribute("aria-pressed") !== "true";
        tab.setAttribute("aria-pressed", next ? "true" : "false");
        tab.classList.toggle("is-active", next);
        clearError();
      });
    }

    const clearError = () => {
      if (!errorEl) return;
      errorEl.hidden = true;
      errorEl.textContent = "";
    };

    const showError = message => {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
      errorEl.removeAttribute("hidden");
    };

    const setSubmitting = active => {
      submitting = active;
      if (!submitBtn) return;
      submitBtn.disabled = active;
      submitBtn.classList.toggle("is-loading", active);
      submitBtn.textContent = active ? "Enviando…" : "Suscribirme";
    };

    const showSuccess = () => {
      form.hidden = true;
      popup.classList.add("is-success");
      if (success) {
        success.hidden = false;
        success.removeAttribute("hidden");
      }
    };

    const openPopup = trigger => {
      lastTrigger = trigger || document.activeElement;
      popup.classList.remove("is-success");
      clearError();
      setSubmitting(false);
      if (success) success.hidden = true;
      form.hidden = false;
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.removeAttribute("hidden");
      }
      popup.hidden = false;
      popup.removeAttribute("hidden");
      document.body.classList.add("newsletter-open");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          popup.classList.add("is-open");
          if (backdrop) backdrop.classList.add("is-open");
        });
      });
      const first = popup.querySelector("#nl-nombre");
      if (first) first.focus();
    };

    const closePopup = () => {
      if (submitting) return;
      popup.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.classList.remove("newsletter-open");
      const finish = () => {
        popup.hidden = true;
        if (backdrop) backdrop.hidden = true;
        if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
      };
      window.setTimeout(finish, 280);
    };

    document.addEventListener("click", event => {
      const button = event.target.closest("[data-newsletter-open]");
      if (!button) return;

      event.preventDefault();
      openPopup(button);
    });

    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    if (backdrop) backdrop.addEventListener("click", closePopup);

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (popup.classList.contains("is-open")) closePopup();
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (submitting) return;

      clearError();

      const emailInput = form.querySelector("#nl-email");
      const consent = form.querySelector("#nl-acepta");
      const email = (emailInput && emailInput.value ? emailInput.value : "").trim();
      const intereses = getSelectedInterests();

      if (!email || (emailInput && typeof emailInput.checkValidity === "function" && !emailInput.checkValidity())) {
        showError("Ingresá un email válido.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (!intereses.length) {
        showError("Seleccioná al menos un área de interés.");
        interestTabs?.querySelector(".nl-interest-tab")?.focus();
        return;
      }

      if (!consent || !consent.checked) {
        showError("Tenés que aceptar recibir el newsletter para continuar.");
        if (consent) consent.focus();
        return;
      }

      const endpoint =
        form.getAttribute("data-newsletter-endpoint") ||
        (window.MACROLED_HOME_CONFIG && window.MACROLED_HOME_CONFIG.newsletterEndpoint) ||
        DEFAULT_ENDPOINT;

      const payload = {
        email,
        intereses,
        acepta_newsletter: true
      };

      setSubmitting(true);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          let message = "No pudimos completar la suscripción. Intentá de nuevo.";
          try {
            const data = await res.json();
            if (data && data.error) message = data.error;
          } catch (_) {
            /* ignore non-JSON error bodies */
          }
          showError(message);
          setSubmitting(false);
          return;
        }

        form.reset();
        clearInterestTabs();
        setSubmitting(false);
        showSuccess();
      } catch (_) {
        showError("No pudimos conectar con el servidor. Intentá de nuevo.");
        setSubmitting(false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsletter, { once: true });
  } else {
    initNewsletter();
  }
})();
