export function isPlainClick(event) {
  return event.button === 0 &&
    !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function initNavigation() {
  const links = [...document.querySelectorAll(".nav-links a")].filter(
    (link) => document.getElementById(link.getAttribute("aria-controls"))
  );
  const panels = links.map((link) =>
    document.getElementById(link.getAttribute("aria-controls"))
  );
  const listeners = new Set();

  function showSection() {
    const activePanel = panels.find(
      (panel) => panel.id === window.location.hash.slice(1)
    ) ?? panels.find((panel) => panel.id === "about") ?? panels[0];
    if (!activePanel) return;

    panels.forEach((panel) => { panel.hidden = panel !== activePanel; });
    links.forEach((link) => {
      const isActive = link.getAttribute("aria-controls") === activePanel.id;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const activeLink = links.find(
      (link) => link.getAttribute("aria-controls") === activePanel.id
    );
    document.title = "Vlad Vovk - Design, Code & AI · " + activeLink.textContent.trim();
    const mobileSection = document.querySelector(".mobile-section-toggle");
    if (mobileSection) {
      mobileSection.replaceChildren(
        activeLink.querySelector("svg").cloneNode(true),
        activeLink.querySelector("span").cloneNode(true)
      );
    }
    listeners.forEach((listener) => listener(activePanel.id));
  }

  function navigate(sectionId) {
    if (!panels.some((panel) => panel.id === sectionId)) return;
    const hash = "#" + sectionId;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    showSection();
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      navigate(link.getAttribute("aria-controls"));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
    const digit = event.code.match(/^(?:Digit|Numpad)([1-5])$/)?.[1] ?? event.key;
    if (!/^[1-5]$/.test(digit)) return;
    const link = links[Number(digit) - 1];
    if (!link) return;
    event.preventDefault();
    if (event.repeat || document.querySelector("dialog[open]")) return;
    navigate(link.getAttribute("aria-controls"));
    link.focus({ preventScroll: true });
  }, true);

  window.addEventListener("popstate", showSection);
  window.addEventListener("hashchange", showSection);
  showSection();

  return {
    links,
    navigate,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
