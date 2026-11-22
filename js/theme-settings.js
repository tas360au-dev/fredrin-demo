const groups = [
  { id: "surfaces", label: "Surfaces & borders" },
  { id: "text", label: "Text & icons" },
  { id: "accents", label: "Accents & palette" },
  { id: "shadows", label: "Shadows & overlays" },
  { id: "controls", label: "Theme controls" },
  { id: "illustration", label: "Illustration & base colors" }
];

function groupFor(name) {
  if (/^--(cat-|mask-|color-)/.test(name)) return "illustration";
  if (/^--(shadow-|drawer-scrim|project-glow|avatar-shadow)/.test(name)) return "shadows";
  if (/^--theme-/.test(name)) return "controls";
  if (/^--(text|muted|ink-|tooltip-text|tooltip-key-text|experience-.*-text)/.test(name)) return "text";
  if (/^--(palette-|amber|project-accent|chart-|notification-)/.test(name)) return "accents";
  return "surfaces";
}

const colorLabels = {
  "--page": "Page background", "--sidebar": "Sidebar background",
  "--surface": "Card background", "--surface-hover": "Hover background",
  "--surface-selected": "Selected background", "--line": "Dividers",
  "--card-line": "Card borders", "--text": "Primary text", "--muted": "Secondary text",
  "--amber": "Accent", "--ink-on-accent": "Text on accent",
  "--text-description": "Descriptions", "--text-card-heading": "Card headings",
  "--surface-panel": "Popup background", "--panel-border": "Popup borders"
};
const labelFor = (name) => colorLabels[name] ||
  name.replace(/^--(?:palette-)?/, "").replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase());
const hexByte = (value) => Math.round(value).toString(16).padStart(2, "0");
const toHex = ([r, g, b, a]) => "#" + [r, g, b].map(hexByte).join("") + (a < 1 ? hexByte(a * 255) : "");

export function initThemeSettings(accountPanels) {
  const theme = window.fredrinTheme;
  const dialog = document.getElementById("theme-settings");
  const openButton = document.getElementById("theme-settings-open");
  if (!theme || !dialog || !openButton) return;

  const search = dialog.querySelector("#theme-color-search");
  const categories = dialog.querySelector("#theme-color-categories");
  const mobileCategory = dialog.querySelector("#theme-mobile-category");
  const list = dialog.querySelector("#theme-color-list");
  const heading = dialog.querySelector("#theme-colors-heading");
  const count = dialog.querySelector("#theme-color-count");
  const empty = dialog.querySelector("#theme-color-empty");
  const status = dialog.querySelector("#theme-settings-status");
  const baseButtons = [...dialog.querySelectorAll("[data-theme-base]")];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let draft;
  let baseline;
  let tokens = [];
  let category = groups[0].id;
  const rows = new Map();

  function rgbaFor(value) {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    // Canvas preserves RGB in its serialized rgba value even at zero opacity.
    const serialized = context.fillStyle;
    if (/^#[\da-f]{6,8}$/i.test(serialized)) {
      return [1, 3, 5].map((offset) => parseInt(serialized.slice(offset, offset + 2), 16))
        .concat(serialized.length === 9 ? parseInt(serialized.slice(7, 9), 16) / 255 : 1);
    }
    const rgb = serialized.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
    if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])];
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  }

  function markChanged() {
    status.textContent = "Unsaved changes. Save to keep this theme.";
  }

  function syncRows(editedName, editedColor) {
    const style = getComputedStyle(document.documentElement);
    rows.forEach((row, name) => {
      row.rgba = name === editedName ? editedColor : rgbaFor(style.getPropertyValue(name).trim());
      const [r, g, b, alpha] = row.rgba;
      row.picker.value = "#" + [r, g, b].map(hexByte).join("");
      row.value.value = toHex(row.rgba);
      row.opacity.value = Math.round(alpha * 100);
      row.output.textContent = Math.round(alpha * 100) + "%";
      row.reset.disabled = !(name in draft.colors[draft.base]);
    });
  }

  function applyColor(name, rgba) {
    draft.colors[draft.base][name] = toHex(rgba);
    theme.preview(draft);
    syncRows(name, rgba);
    markChanged();
  }

  function makeRow(name) {
    const label = labelFor(name);
    const row = document.createElement("div");
    row.className = "theme-color-row";
    row.dataset.token = name;
    const title = document.createElement("span");
    title.className = "theme-color-name";
    title.textContent = label;
    const picker = document.createElement("input");
    picker.type = "color";
    picker.className = "theme-color-picker";
    picker.setAttribute("aria-label", label + " color");
    const value = document.createElement("input");
    value.type = "text";
    value.className = "theme-color-value";
    value.spellcheck = false;
    value.autocomplete = "off";
    value.setAttribute("aria-label", label + " HEX value");
    const opacityGroup = document.createElement("div");
    opacityGroup.className = "theme-color-opacity";
    const opacity = document.createElement("input");
    opacity.type = "range";
    opacity.min = "0";
    opacity.max = "100";
    opacity.setAttribute("aria-label", label + " opacity");
    const output = document.createElement("span");
    opacityGroup.append(opacity, output);
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "theme-icon-button theme-color-reset";
    reset.setAttribute("aria-label", "Reset " + label);
    reset.title = "Reset " + label;
    reset.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6" /></svg>';
    const controls = { picker, value, opacity, output, reset, rgba: [0, 0, 0, 1] };
    rows.set(name, controls);
    picker.addEventListener("input", () => {
      const rgba = rgbaFor(picker.value);
      rgba[3] = controls.rgba[3];
      applyColor(name, rgba);
    });
    opacity.addEventListener("input", () => {
      applyColor(name, [...controls.rgba.slice(0, 3), Number(opacity.value) / 100]);
    });
    value.addEventListener("change", () => {
      let color = value.value.trim();
      if (!color.startsWith("#")) color = "#" + color;
      if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)) {
        value.value = toHex(controls.rgba);
        status.textContent = "Use a HEX color, such as #5273A8 or #5273A880.";
        return;
      }
      applyColor(name, rgbaFor(color));
    });
    reset.addEventListener("click", () => {
      delete draft.colors[draft.base][name];
      theme.preview(draft);
      syncRows();
      markChanged();
    });
    row.append(title, picker, value, opacityGroup, reset);
    return row;
  }

  function render() {
    rows.clear();
    const query = search.value.trim().toLowerCase();
    const visible = tokens.filter((name) => query ?
      (labelFor(name) + " " + name).toLowerCase().includes(query) : groupFor(name) === category);
    heading.textContent = query ? "Search results" : groups.find((group) => group.id === category).label;
    count.textContent = visible.length + (visible.length === 1 ? " color" : " colors");
    list.replaceChildren(...visible.map(makeRow));
    empty.hidden = visible.length !== 0;
    categories.querySelectorAll("button").forEach((button) => {
      const active = !query && button.dataset.category === category;
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    baseButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.themeBase === draft.base)));
    mobileCategory.value = category;
    syncRows();
    dialog.querySelector(".theme-settings-editor").scrollTop = 0;
  }

  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = group.id;
    button.textContent = group.label;
    button.addEventListener("click", () => {
      category = group.id;
      search.value = "";
      render();
    });
    categories.append(button);
    mobileCategory.add(new Option(group.label, group.id));
  });

  function open() {
    if (dialog.open || dialog.classList.contains("is-closing")) return;
    accountPanels.close();
    draft = theme.getState();
    baseline = theme.getState();
    tokens = theme.getTokens();
    category = groups[0].id;
    search.value = "";
    status.textContent = "Changes are previewed until you save.";
    render();
    dialog.showModal();
  }

  function requestClose() {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing");
    const close = () => {
      if (dialog.open && dialog.classList.contains("is-closing")) dialog.close();
    };
    const animation = dialog.getAnimations().find((entry) => entry.animationName === "theme-settings-out");
    if (animation) animation.finished.then(close, close);
    else close();
  }

  document.addEventListener("fredrin:theme-change", () => {
    if (!draft || !dialog.open || dialog.classList.contains("is-closing")) return;
    draft = theme.rebase(draft, baseline);
    baseline = theme.getState();
    theme.preview(draft);
    render();
    status.textContent = "Saved colors updated from another tab. Your unsaved edits are kept.";
  });

  openButton.addEventListener("click", open);
  search.addEventListener("input", render);
  mobileCategory.addEventListener("change", () => {
    category = mobileCategory.value;
    search.value = "";
    render();
  });
  baseButtons.forEach((button) => button.addEventListener("click", () => {
    draft.base = button.dataset.themeBase;
    theme.preview(draft);
    render();
    markChanged();
  }));
  dialog.querySelector("#theme-reset").addEventListener("click", () => {
    draft.colors[draft.base] = {};
    theme.preview(draft);
    render();
    status.textContent = "Original " + draft.base + " colors restored. Save to keep this change.";
  });
  dialog.querySelector("#theme-save").addEventListener("click", () => {
    if (theme.save(draft, baseline)) requestClose();
    else {
      draft = theme.getState();
      baseline = theme.getState();
      status.textContent = "Browser storage is unavailable. Theme saved for this session.";
    }
  });
  dialog.querySelectorAll(".theme-settings-close, #theme-cancel").forEach((button) => {
    button.addEventListener("click", requestClose);
  });
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom)) requestClose();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener("close", () => {
    dialog.classList.remove("is-closing");
    theme.restore();
    draft = null;
    baseline = null;
    document.querySelector(".account-actions .avatar")?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.code === "Comma") {
      event.preventDefault();
      open();
    }
  });
}
