(() => {
  const root = document.documentElement;
  const themeKey = "fredrin-theme";
  const colorsKey = "fredrin-custom-themes";
  const validTheme = (value) => value === "light" || value === "dark";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const fixedTokens = new Set(["--mask-visible", "--mask-hidden"]);
  let appliedTokens = new Set();

  function cleanColors(colors) {
    if (!colors || typeof colors !== "object" || Array.isArray(colors)) return {};
    return Object.fromEntries(Object.entries(colors).filter(([name, value]) =>
      /^--[a-z][a-z0-9-]*$/.test(name) && !fixedTokens.has(name) &&
      typeof value === "string" && value.length <= 200 &&
      CSS.supports("color", value)
    ));
  }

  function readStored(fallback) {
    const state = { base: "dark", colors: { dark: {}, light: {} } };
    try {
      const base = localStorage.getItem(themeKey);
      if (validTheme(base)) state.base = base;
      const custom = JSON.parse(localStorage.getItem(colorsKey) || "null");
      if (custom?.version === 1) {
        state.colors.dark = cleanColors(custom.dark);
        state.colors.light = cleanColors(custom.light);
      }
    } catch {
      // Preserve session settings if storage cannot be read.
      if (fallback) return clone(fallback);
    }
    return state;
  }

  let saved = readStored();

  function apply(state) {
    appliedTokens.forEach((name) => root.style.removeProperty(name));
    const colors = cleanColors(state.colors[state.base]);
    appliedTokens = new Set(Object.keys(colors));
    Object.entries(colors).forEach(([name, value]) => root.style.setProperty(name, value));
    root.dataset.theme = state.base;
    const button = document.querySelector(".theme-toggle");
    if (button) {
      button.setAttribute("aria-checked", String(state.base === "dark"));
      button.title = state.base === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
  }

  function mergeChanges(latest, state, baseline) {
    const result = clone(latest);
    if (state.base !== baseline.base && validTheme(state.base)) result.base = state.base;
    for (const base of ["dark", "light"]) {
      const before = cleanColors(baseline.colors[base]);
      const after = cleanColors(state.colors[base]);
      for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
        if (before[name] === after[name]) continue;
        if (Object.hasOwn(after, name)) result.colors[base][name] = after[name];
        else delete result.colors[base][name];
      }
    }
    return result;
  }

  function save(state, baseline = saved) {
    const merged = mergeChanges(readStored(saved), state, baseline);
    saved = {
      base: merged.base,
      colors: {
        dark: cleanColors(merged.colors.dark),
        light: cleanColors(merged.colors.light)
      }
    };
    apply(saved);
    try {
      localStorage.setItem(colorsKey, JSON.stringify({ version: 1, ...saved.colors }));
      localStorage.setItem(themeKey, saved.base);
      return true;
    } catch {
      // Retain saved settings for this session if storage is unavailable.
      return false;
    }
  }

  function getTokens() {
    const sheet = [...document.styleSheets].find((entry) =>
      entry.href && new URL(entry.href).pathname.endsWith("/themes.css")
    );
    if (!sheet) return [];
    try {
      const rule = [...sheet.cssRules].find((entry) => entry.selectorText === ":root");
      return rule ? [...rule.style].filter((name) => name.startsWith("--") && !fixedTokens.has(name) &&
        CSS.supports("color", rule.style.getPropertyValue(name))) : [];
    } catch {
      return [];
    }
  }

  window.fredrinTheme = Object.freeze({
    getState: () => clone(saved),
    getTokens,
    rebase: (state, baseline) => mergeChanges(saved, state, baseline),
    preview: (state) => apply(state),
    restore: () => apply(saved),
    save
  });

  apply(saved);
  document.addEventListener("DOMContentLoaded", () => {
    // Limit persisted overrides to the tokens actually declared by this project.
    const tokens = new Set(getTokens());
    if (tokens.size) {
      for (const base of ["dark", "light"]) {
        saved.colors[base] = Object.fromEntries(Object.entries(saved.colors[base])
          .filter(([name]) => tokens.has(name)));
      }
    }
    apply(saved);
    const button = document.querySelector(".theme-toggle");
    const selectTheme = (base) => save({ ...saved, base });
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
    if (event.key === themeKey || event.key === colorsKey || event.key === null) {
      saved = readStored(saved);
      apply(saved);
      document.dispatchEvent(new CustomEvent("fredrin:theme-change"));
    }
  });
})();
