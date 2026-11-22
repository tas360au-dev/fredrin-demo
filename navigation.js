const navigationLinks = [...document.querySelectorAll(".nav-links a")];
const panels = navigationLinks.map((link) =>
  document.getElementById(link.getAttribute("aria-controls"))
);

function showSection() {
  const requestedSection = window.location.hash.slice(1);
  const activePanel =
    panels.find((panel) => panel.id === requestedSection) ??
    document.getElementById("projects");

  for (const panel of panels) {
    panel.hidden = panel !== activePanel;
  }

  for (const link of navigationLinks) {
    const isActive = link.getAttribute("aria-controls") === activePanel.id;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  const activeLink = navigationLinks.find(
    (link) => link.getAttribute("aria-controls") === activePanel.id
  );
  document.title = "Vlad Vovk - Design, Code & AI · " + activeLink.textContent.trim();
  const mobileSection = document.querySelector(".mobile-section-toggle");
  mobileSection.replaceChildren(
    activeLink.querySelector("svg").cloneNode(true),
    activeLink.querySelector("span").cloneNode(true)
  );
}

for (const link of navigationLinks) {
  link.addEventListener("click", (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const hash = link.getAttribute("href");

    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }

    showSection();
  });
}

window.addEventListener("popstate", showSection);
window.addEventListener("hashchange", showSection);
showSection();

const accountActions = document.querySelector(".account-actions");
const profileButton = accountActions.querySelector(".avatar");
const profileMenu = document.getElementById("profile-menu");
const notificationButton = accountActions.querySelector(".notification-button");
const notificationsPanel = document.getElementById("notifications-panel");

function setAccountPanelOpen(button, panel, isOpen) {
  button.setAttribute("aria-expanded", String(isOpen));
  panel.setAttribute("aria-hidden", String(!isOpen));
  panel.inert = !isOpen;
  panel.classList.toggle("is-open", isOpen);
}

function setProfileMenuOpen(isOpen) {
  setAccountPanelOpen(profileButton, profileMenu, isOpen);
}

function setNotificationsOpen(isOpen) {
  setAccountPanelOpen(notificationButton, notificationsPanel, isOpen);
}

function closeAccountPanels() {
  setProfileMenuOpen(false);
  setNotificationsOpen(false);
}

profileButton.addEventListener("click", () => {
  const isOpen = profileButton.getAttribute("aria-expanded") === "true";
  setNotificationsOpen(false);
  setProfileMenuOpen(!isOpen);
});

notificationButton.addEventListener("click", () => {
  const isOpen = notificationButton.getAttribute("aria-expanded") === "true";
  setProfileMenuOpen(false);
  setNotificationsOpen(!isOpen);
});

document.addEventListener("pointerdown", (event) => {
  if (!accountActions.contains(event.target)) {
    closeAccountPanels();
  }
});

document.addEventListener("focusin", (event) => {
  if (!accountActions.contains(event.target)) {
    closeAccountPanels();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openButton = [profileButton, notificationButton].find(
    (button) => button.getAttribute("aria-expanded") === "true"
  );
  if (openButton) {
    closeAccountPanels();
    openButton.focus();
  }
});

const sidebarToggle = document.querySelector(".personal-row");
const sidebarProjects = document.getElementById("sidebar-projects");

sidebarToggle.addEventListener("click", () => {
  const isExpanded = sidebarToggle.getAttribute("aria-expanded") === "true";
  sidebarToggle.setAttribute("aria-expanded", String(!isExpanded));
  sidebarProjects.hidden = isExpanded;
});

sidebarProjects.querySelector(".project-row").addEventListener("click", (event) => {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  document.getElementById("nav-projects").click();
});

const navigationTooltip = document.createElement("div");
navigationTooltip.id = "navigation-tooltip";
navigationTooltip.className = "nav-tooltip";
navigationTooltip.setAttribute("role", "tooltip");
navigationTooltip.hidden = true;

const tooltipLabel = document.createElement("span");
const tooltipShortcut = document.createElement("kbd");
navigationTooltip.append(tooltipLabel, tooltipShortcut);
document.body.append(navigationTooltip);

let tooltipTimer;
let tooltipLink;

function hideNavigationTooltip() {
  window.clearTimeout(tooltipTimer);
  navigationTooltip.hidden = true;
  tooltipLink?.removeAttribute("aria-describedby");
  tooltipLink = null;
}

function scheduleNavigationTooltip(link, index) {
  hideNavigationTooltip();
  tooltipLink = link;

  tooltipTimer = window.setTimeout(() => {
    tooltipLabel.textContent = link.querySelector("span").textContent;
    tooltipShortcut.textContent = "Ctrl+" + (index + 1);
    navigationTooltip.hidden = false;

    const linkBounds = link.getBoundingClientRect();
    const tooltipWidth = navigationTooltip.getBoundingClientRect().width;
    const linkCenter = linkBounds.left + linkBounds.width / 2;
    const left = Math.max(
      8,
      Math.min(linkCenter - tooltipWidth / 2, window.innerWidth - tooltipWidth - 8)
    );

    navigationTooltip.style.left = left + "px";
    navigationTooltip.style.top = linkBounds.bottom + 18 + "px";
    navigationTooltip.style.setProperty("--tooltip-arrow", linkCenter - left + "px");
    link.setAttribute("aria-describedby", navigationTooltip.id);
  }, 1000);
}

navigationLinks.forEach((link, index) => {
  link.setAttribute("aria-keyshortcuts", "Control+" + (index + 1));

  link.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      scheduleNavigationTooltip(link, index);
    }
  });
  link.addEventListener("pointerleave", hideNavigationTooltip);
  link.addEventListener("focus", () => {
    if (link.matches(":focus-visible")) {
      scheduleNavigationTooltip(link, index);
    }
  });
  link.addEventListener("blur", hideNavigationTooltip);
  link.addEventListener("click", hideNavigationTooltip);
});

document.addEventListener("pointerdown", hideNavigationTooltip);
window.addEventListener("resize", hideNavigationTooltip);
window.addEventListener("scroll", hideNavigationTooltip, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideNavigationTooltip();
    return;
  }

  if (!event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return;
  }

  const digit = event.code.match(/^(?:Digit|Numpad)([1-5])$/)?.[1] ?? event.key;
  if (!/^[1-5]$/.test(digit)) {
    return;
  }

  event.preventDefault();
  if (event.repeat) {
    return;
  }

  const link = navigationLinks[Number(digit) - 1];
  link.click();
  link.focus({ preventScroll: true });
  hideNavigationTooltip();
}, true);


const talkingCat = document.querySelector(".about-illustration");
const catSpeech = document.getElementById("cat-speech");
const catPhrases = [
  "Bloody good startup!",
  "Purr request approved",
  "Meow or never!",
  "Hire my human",
  "No bugs. Just features",
  "Powered by coffee",
  "I live in Meowai",
  "Ctrl + Meow",
  "Trust the paws",
  "Ship it!"
];
let catPhraseIndex = 0;
let catSpeechTimer;

function speakCat() {
  window.clearTimeout(catSpeechTimer);
  catSpeech.textContent = catPhrases[catPhraseIndex];
  catPhraseIndex = (catPhraseIndex + 1) % catPhrases.length;
  catSpeech.classList.add("is-visible");
  catSpeechTimer = window.setTimeout(() => {
    catSpeech.classList.remove("is-visible");
  }, 3500);
}

talkingCat.addEventListener("click", speakCat);
talkingCat.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    speakCat();
  }
  if (event.key === "Escape") {
    window.clearTimeout(catSpeechTimer);
    catSpeech.classList.remove("is-visible");
  }
});

const mobileLayout = window.matchMedia("(max-width: 900px)");
const sidebar = document.getElementById("project-sidebar");
const workspace = document.querySelector(".workspace");
const menuToggle = document.querySelector(".mobile-menu-toggle");
const sectionToggle = document.querySelector(".mobile-section-toggle");
const drawerClose = document.querySelector(".mobile-drawer-close");
const drawerBackdrop = document.querySelector(".mobile-nav-backdrop");
const navigationGroup = document.querySelector(".nav-links");
const navigationPosition = document.createComment("Desktop navigation position");
navigationGroup.before(navigationPosition);

function setMobileDrawerOpen(isOpen, restoreFocus = false) {
  const open = mobileLayout.matches && isOpen;
  document.body.classList.toggle("mobile-drawer-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  sectionToggle.setAttribute("aria-expanded", String(open));
  drawerBackdrop.hidden = !open;
  workspace.inert = open;
  sidebar.inert = mobileLayout.matches && !open;

  if (open) {
    closeAccountPanels();
    hideNavigationTooltip();
    drawerClose.focus();
  } else if (restoreFocus && mobileLayout.matches) {
    menuToggle.focus();
  }
}

menuToggle.addEventListener("click", () => setMobileDrawerOpen(true));
sectionToggle.addEventListener("click", () => setMobileDrawerOpen(true));
drawerClose.addEventListener("click", () => setMobileDrawerOpen(false, true));
drawerBackdrop.addEventListener("click", () => setMobileDrawerOpen(false, true));

navigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (mobileLayout.matches && event.defaultPrevented) {
      setMobileDrawerOpen(false);
      sectionToggle.focus();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("mobile-drawer-open")) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    setMobileDrawerOpen(false, true);
    return;
  }
  if (event.key !== "Tab") {
    return;
  }

  const focusable = [...sidebar.querySelectorAll("a[href], button, [tabindex='0']")]
    .filter((element) => element.getClientRects().length > 0 && !element.disabled);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const projectAccordions = [
  ...document.querySelectorAll(".board details.column, .board details.project-card")
];
const mobileAccordionState = new WeakMap();
let previousLayoutWasMobile = false;

projectAccordions.forEach((accordion) => {
  accordion.querySelector(":scope > summary").addEventListener("click", (event) => {
    if (!mobileLayout.matches) {
      event.preventDefault();
    }
  });
});

function applyResponsiveLayout() {
  document.querySelector(".animated-cat").setAttribute("preserveAspectRatio", mobileLayout.matches ? "xMidYMid meet" : "xMaxYMid meet");
  if (previousLayoutWasMobile) {
    projectAccordions.forEach((accordion) => {
      mobileAccordionState.set(accordion, accordion.open);
    });
  }
  setMobileDrawerOpen(false);
  closeAccountPanels();
  hideNavigationTooltip();

  if (mobileLayout.matches) {
    sidebar.insertBefore(navigationGroup, sidebar.querySelector(".sidebar-footer"));
  } else {
    navigationPosition.after(navigationGroup);
  }

  projectAccordions.forEach((accordion) => {
    accordion.open = mobileLayout.matches
      ? mobileAccordionState.get(accordion) ?? false
      : true;
    accordion.querySelector(":scope > summary").tabIndex = mobileLayout.matches ? 0 : -1;
  });
  previousLayoutWasMobile = mobileLayout.matches;
}

mobileLayout.addEventListener("change", applyResponsiveLayout);
applyResponsiveLayout();
