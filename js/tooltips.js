export function initNavigationTooltips(links) {
  if (!links.length) return { hide() {} };

  const tooltip = document.createElement("div");
  tooltip.id = "navigation-tooltip";
  tooltip.className = "nav-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  const label = document.createElement("span");
  const shortcut = document.createElement("kbd");
  tooltip.append(label, shortcut);
  document.body.append(tooltip);

  let timer;
  let currentLink;

  function hide() {
    window.clearTimeout(timer);
    tooltip.hidden = true;
    currentLink?.removeAttribute("aria-describedby");
    currentLink = null;
  }

  function schedule(link, index) {
    hide();
    currentLink = link;
    timer = window.setTimeout(() => {
      label.textContent = link.querySelector("span").textContent;
      shortcut.textContent = "Ctrl+" + (index + 1);
      tooltip.hidden = false;
      const bounds = link.getBoundingClientRect();
      const width = tooltip.getBoundingClientRect().width;
      const center = bounds.left + bounds.width / 2;
      const left = Math.max(8, Math.min(center - width / 2, window.innerWidth - width - 8));
      tooltip.style.left = left + "px";
      tooltip.style.top = bounds.bottom + 18 + "px";
      tooltip.style.setProperty("--tooltip-arrow", center - left + "px");
      link.setAttribute("aria-describedby", tooltip.id);
    }, 1000);
  }

  links.forEach((link, index) => {
    link.setAttribute("aria-keyshortcuts", "Control+" + (index + 1));
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") schedule(link, index);
    });
    link.addEventListener("pointerleave", hide);
    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) schedule(link, index);
    });
    link.addEventListener("blur", hide);
    link.addEventListener("click", hide);
  });

  document.addEventListener("pointerdown", hide);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.ctrlKey) hide();
  });
  window.addEventListener("resize", hide);
  window.addEventListener("scroll", hide, true);
  return { hide };
}
