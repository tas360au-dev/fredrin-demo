export function initMobileLayout({ navigation, accountPanels, tooltips, cat }) {
  const media = window.matchMedia("(max-width: 900px)");
  const sidebar = document.getElementById("project-sidebar");
  const workspace = document.querySelector(".workspace");
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const sectionToggle = document.querySelector(".mobile-section-toggle");
  const drawerClose = document.querySelector(".mobile-drawer-close");
  const backdrop = document.querySelector(".mobile-nav-backdrop");
  const navigationGroup = document.querySelector(".nav-links");
  if (![sidebar, workspace, menuToggle, sectionToggle, drawerClose, backdrop, navigationGroup].every(Boolean)) return;

  const navigationPosition = document.createComment("Desktop navigation position");
  navigationGroup.before(navigationPosition);

  function setDrawerOpen(isOpen, restoreFocus = false) {
    const open = media.matches && isOpen;
    document.body.classList.toggle("mobile-drawer-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    sectionToggle.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;
    workspace.inert = open;
    sidebar.inert = media.matches && !open;
    if (open) {
      accountPanels.close();
      tooltips.hide();
      drawerClose.focus();
    } else if (restoreFocus && media.matches) {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", () => setDrawerOpen(true));
  sectionToggle.addEventListener("click", () => setDrawerOpen(true));
  drawerClose.addEventListener("click", () => setDrawerOpen(false, true));
  backdrop.addEventListener("click", () => setDrawerOpen(false, true));
  navigation.onChange(() => {
    if (media.matches) {
      setDrawerOpen(false);
      sectionToggle.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("mobile-drawer-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setDrawerOpen(false, true);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...sidebar.querySelectorAll("a[href], button, [tabindex='0']")]
      .filter((element) => element.getClientRects().length > 0 && !element.disabled);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  const accordions = [...document.querySelectorAll(".board details.column, .board details.project-card")];
  const mobileState = new WeakMap();
  let wasMobile = false;
  accordions.forEach((accordion) => {
    accordion.querySelector(":scope > summary")?.addEventListener("click", (event) => {
      if (!media.matches) event.preventDefault();
    });
  });

  function applyLayout() {
    cat.setLayout(media.matches);
    if (wasMobile) accordions.forEach((accordion) => mobileState.set(accordion, accordion.open));
    setDrawerOpen(false);
    accountPanels.close();
    tooltips.hide();
    if (media.matches) sidebar.insertBefore(navigationGroup, sidebar.querySelector(".sidebar-footer"));
    else navigationPosition.after(navigationGroup);
    accordions.forEach((accordion) => {
      const defaultMobileOpen = Boolean(accordion.closest(".backlog-column"));
      accordion.open = media.matches ? mobileState.get(accordion) ?? defaultMobileOpen : true;
      const summary = accordion.querySelector(":scope > summary");
      if (summary) summary.tabIndex = media.matches ? 0 : -1;
    });
    wasMobile = media.matches;
  }

  media.addEventListener("change", applyLayout);
  applyLayout();
}
