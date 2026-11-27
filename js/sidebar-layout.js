(() => {
  const root = document.documentElement;
  const storageKey = "fredrin-sidebar-layout";
  const minWidth = 180;
  const maxWidth = 420;
  const defaultWidth = 209;
  const desktop = window.matchMedia("(min-width: 901px)");
  const clamp = (width) => Math.round(Math.max(minWidth, Math.min(maxWidth, width)));

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return {
        width: typeof saved?.width === "number" && Number.isFinite(saved.width) ? clamp(saved.width) : defaultWidth,
        collapsed: saved?.collapsed === true
      };
    } catch {
      return { width: defaultWidth, collapsed: false };
    }
  }

  let state = readState();

  function applyGeometry() {
    root.style.setProperty("--sidebar-content-width", state.width + "px");
    root.toggleAttribute("data-sidebar-collapsed", state.collapsed);
  }

  // Restore geometry before styles load so a saved layout does not jump on refresh.
  applyGeometry();

  document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("sidebar-content");
    const rail = document.querySelector(".sidebar-rail");
    const resize = document.querySelector(".sidebar-resize");
    if (!content || !rail || !resize) return;
    let drag;
    let animationTimer;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function finishAnimation() {
      window.clearTimeout(animationTimer);
      root.classList.remove("is-sidebar-animating");
    }

    content.parentElement.addEventListener("transitionend", (event) => {
      if (event.target === content.parentElement && event.propertyName === "width") finishAnimation();
    });

    function persist() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Resizing and collapsing still work when storage is unavailable.
      }
    }

    function render() {
      applyGeometry();
      content.inert = desktop.matches && state.collapsed;
      rail.hidden = !desktop.matches;
      resize.hidden = !desktop.matches || state.collapsed;
      rail.setAttribute("aria-expanded", String(!state.collapsed));
      const action = state.collapsed ? "Expand sidebar" : "Collapse sidebar";
      rail.setAttribute("aria-label", action);
      rail.title = action + " (Ctrl+\\)";
      resize.setAttribute("aria-valuenow", state.width);
      resize.setAttribute("aria-valuetext", state.width + " pixels");
    }

    function finishDrag(cancel = false) {
      if (!drag) return;
      const previous = drag;
      drag = null;
      if (cancel) state.width = previous.width;
      root.classList.remove("is-sidebar-resizing");
      if (resize.hasPointerCapture(previous.pointerId)) resize.releasePointerCapture(previous.pointerId);
      render();
      if (!cancel) persist();
    }

    function toggleSidebar() {
      if (!desktop.matches) return;
      finishDrag(true);
      window.clearTimeout(animationTimer);
      if (!reducedMotion.matches) {
        root.classList.add("is-sidebar-animating");
        animationTimer = window.setTimeout(finishAnimation, 240);
      }
      state.collapsed = !state.collapsed;
      if (state.collapsed && (content.contains(document.activeElement) || document.activeElement === resize)) rail.focus({ preventScroll: true });
      render();
      persist();
    }

    rail.addEventListener("click", toggleSidebar);
    resize.addEventListener("pointerdown", (event) => {
      if (!desktop.matches || state.collapsed || root.classList.contains("is-sidebar-animating") ||
          event.button !== 0 || !event.isPrimary || drag) return;
      event.preventDefault();
      drag = { pointerId: event.pointerId, x: event.clientX, width: state.width };
      resize.setPointerCapture(event.pointerId);
      root.classList.add("is-sidebar-resizing");
    });
    resize.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      state.width = clamp(drag.width + event.clientX - drag.x);
      render();
    });
    resize.addEventListener("pointerup", (event) => {
      if (drag?.pointerId === event.pointerId) finishDrag();
    });
    resize.addEventListener("pointercancel", () => finishDrag(true));
    resize.addEventListener("lostpointercapture", () => finishDrag(true));
    window.addEventListener("blur", () => finishDrag(true));

    resize.addEventListener("keydown", (event) => {
      if (!desktop.matches || state.collapsed || drag || root.classList.contains("is-sidebar-animating")) return;
      const step = event.shiftKey ? 50 : 10;
      const widths = {
        ArrowLeft: state.width - step,
        ArrowRight: state.width + step,
        Home: minWidth,
        End: maxWidth
      };
      if (!(event.key in widths) || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      state.width = clamp(widths[event.key]);
      render();
      persist();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drag) {
        event.preventDefault();
        finishDrag(true);
        return;
      }
      if (!desktop.matches || !event.ctrlKey || event.altKey || event.metaKey || event.shiftKey ||
          (event.code !== "Backslash" && event.key !== "\\")) return;
      if (document.querySelector("dialog[open]") ||
          event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      event.preventDefault();
      if (!event.repeat) toggleSidebar();
    });

    desktop.addEventListener("change", () => {
      finishAnimation();
      finishDrag(true);
      render();
    });
    window.addEventListener("storage", (event) => {
      if (drag || (event.key !== storageKey && event.key !== null)) return;
      finishAnimation();
      state = readState();
      if (desktop.matches && state.collapsed && (content.contains(document.activeElement) || document.activeElement === resize)) rail.focus({ preventScroll: true });
      render();
    });
    render();
  });
})();