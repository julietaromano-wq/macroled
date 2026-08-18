(function () {
  "use strict";

  function initNewsletter() {
  const popup = document.getElementById("nlPopup");
  const backdrop = document.getElementById("nlBackdrop");
  const form = document.getElementById("nlForm");
  const closeBtn = document.getElementById("nlClose");
  const success = document.getElementById("nlSuccess");

  if (!popup || !form) return;

  let lastTrigger = null;

  function initCustomSelect(wrap) {
    const select = wrap.querySelector("select");
    if (!select || wrap.dataset.enhanced === "1") return;
    wrap.dataset.enhanced = "1";
    select.classList.add("nl-select-native");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "nl-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.innerHTML = '<span class="nl-select-trigger-text"></span><span class="nl-select-chevron" aria-hidden="true"></span>';

    const menu = document.createElement("div");
    menu.className = "nl-select-menu";
    menu.setAttribute("role", "listbox");

    const labelText = trigger.querySelector(".nl-select-trigger-text");

    const syncFromSelect = () => {
      const selected = select.options[select.selectedIndex];
      const isPlaceholder = !selected || selected.disabled || selected.value === "";
      labelText.textContent = selected ? selected.textContent : "";
      trigger.classList.toggle("is-placeholder", isPlaceholder);
      menu.querySelectorAll(".nl-select-option").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.value === select.value && select.value !== "");
      });
    };

    const closeMenu = () => {
      wrap.classList.remove("nl-select-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      document.querySelectorAll(".nl-select-wrap.nl-select-open").forEach(other => {
        if (other !== wrap) other.classList.remove("nl-select-open");
      });
      wrap.classList.add("nl-select-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    Array.prototype.forEach.call(select.options, opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nl-select-option";
      btn.textContent = opt.textContent;
      btn.dataset.value = opt.value;
      if (opt.disabled) btn.disabled = true;
      btn.addEventListener("click", () => {
        if (opt.disabled) return;
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncFromSelect();
        closeMenu();
      });
      menu.appendChild(btn);
    });

    trigger.addEventListener("click", event => {
      event.preventDefault();
      if (wrap.classList.contains("nl-select-open")) closeMenu();
      else openMenu();
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    syncFromSelect();
    select.addEventListener("change", syncFromSelect);
  }

  popup.querySelectorAll(".nl-select-wrap").forEach(initCustomSelect);

  const closeSelects = () => {
    popup.querySelectorAll(".nl-select-wrap.nl-select-open").forEach(wrap => {
      wrap.classList.remove("nl-select-open");
    });
  };

  const openPopup = trigger => {
    lastTrigger = trigger || document.activeElement;
    popup.classList.remove("is-success");
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
    closeSelects();
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

  document.addEventListener("click", event => {
    if (!event.target.closest(".nl-select-wrap")) closeSelects();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (popup.querySelector(".nl-select-open")) {
      closeSelects();
      return;
    }
    if (popup.classList.contains("is-open")) closePopup();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const interest = form.querySelector("#nl-interes");
    if (interest && !interest.value) {
      interest.closest(".nl-select-wrap")?.querySelector(".nl-select-trigger")?.focus();
      return;
    }
    form.hidden = true;
    popup.classList.add("is-success");
    if (success) {
      success.hidden = false;
      success.removeAttribute("hidden");
    }
  });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsletter, { once: true });
  } else {
    initNewsletter();
  }
})();
