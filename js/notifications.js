export function initNotifications() {
  const panel = document.getElementById("notifications-panel");
  const bell = document.querySelector(".notification-button");
  const markAll = panel?.querySelector("[data-mark-all-read]");
  const items = [...(panel?.querySelectorAll("[data-notification-id]") ?? [])];
  if (!panel || !bell || !markAll || !items.length) return;

  const storageKey = "fredrin-read-notifications";
  const knownIds = new Set(items.map((item) => item.dataset.notificationId));

  function loadReadIds(fallback = new Set()) {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter((id) => knownIds.has(id)) : []);
    } catch {
      return fallback;
    }
  }

  let readIds = loadReadIds();

  function render() {
    let unread = 0;
    items.forEach((item) => {
      const isRead = readIds.has(item.dataset.notificationId);
      item.classList.toggle("is-read", isRead);
      const button = item.querySelector("[data-mark-read]");
      if (button) {
        button.hidden = isRead;
        button.disabled = isRead;
        button.setAttribute("aria-label", "Mark as read: " + item.querySelector("h3").textContent);
      }
      if (!isRead) unread += 1;
    });
    bell.classList.toggle("has-unread", unread > 0);
    bell.setAttribute("aria-label", unread ?
      "Notifications: " + unread + " unread notification" + (unread === 1 ? "" : "s") :
      "Notifications: all read");
    markAll.hidden = unread === 0;
    markAll.disabled = unread === 0;
  }

  function markRead(ids) {
    // Merge the latest stored IDs so another tab's read state is not overwritten.
    loadReadIds().forEach((id) => readIds.add(id));
    ids.forEach((id) => readIds.add(id));
    render();
    try {
      localStorage.setItem(storageKey, JSON.stringify([...readIds]));
    } catch {
      // Reading notifications still works for this session without storage.
    }
  }

  items.forEach((item) => {
    item.querySelector("[data-mark-read]")?.addEventListener("click", () => {
      markRead([item.dataset.notificationId]);
    });
  });
  markAll.addEventListener("click", () => markRead(knownIds));
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      readIds = loadReadIds(readIds);
      render();
    }
  });
  render();
}
