(() => {
  const root = document.documentElement;
  const storageKey = "fredrin-theme";
  const validTheme = (value) => value === "light" || value === "dark";
  let initialTheme = "dark";

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (validTheme(savedTheme)) initialTheme = savedTheme;
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const button = document.querySelector(".theme-toggle");
    if (button) {
      button.setAttribute("aria-checked", String(theme === "dark"));
      button.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
  }

  function selectTheme(theme) {
    applyTheme(theme);
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Keep the current session theme even when storage is blocked.
    }
  }

  applyTheme(initialTheme);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(root.dataset.theme);
    const button = document.querySelector(".theme-toggle");
    button?.addEventListener("click", () => {
      selectTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
    button?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        selectTheme(event.key === "ArrowLeft" ? "light" : "dark");
      }
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      applyTheme(validTheme(event.newValue) ? event.newValue : "dark");
    }
  });
})();
