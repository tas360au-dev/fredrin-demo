export function initAccountPanels() {
  const group = document.querySelector(".account-actions");
  const panels = [
    { button: group?.querySelector(".avatar"), panel: document.getElementById("profile-menu") },
    { button: group?.querySelector(".notification-button"), panel: document.getElementById("notifications-panel") }
  ].filter(({ button, panel }) => button && panel);

  function setOpen({ button, panel }, isOpen) {
    button.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.inert = !isOpen;
    panel.classList.toggle("is-open", isOpen);
  }

  function close() {
    panels.forEach((entry) => setOpen(entry, false));
  }

  if (!group || !panels.length) return { close };

  panels.forEach((entry) => {
    entry.button.addEventListener("click", () => {
      const wasOpen = entry.button.getAttribute("aria-expanded") === "true";
      close();
      setOpen(entry, !wasOpen);
    });
  });

  ["pointerdown", "focusin"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (!group.contains(event.target)) close();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const entry = panels.find(({ button }) => button.getAttribute("aria-expanded") === "true");
    if (entry) {
      close();
      entry.button.focus();
    }
  });

  return { close };
}
