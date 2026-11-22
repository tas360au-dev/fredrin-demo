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

function setProfileMenuOpen(isOpen) {
  profileButton.setAttribute("aria-expanded", String(isOpen));
  profileMenu.setAttribute("aria-hidden", String(!isOpen));
  profileMenu.inert = !isOpen;
  profileMenu.classList.toggle("is-open", isOpen);
}

profileButton.addEventListener("click", () => {
  setProfileMenuOpen(profileButton.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("pointerdown", (event) => {
  if (!accountActions.contains(event.target)) {
    setProfileMenuOpen(false);
  }
});

document.addEventListener("focusin", (event) => {
  if (!accountActions.contains(event.target)) {
    setProfileMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    profileButton.getAttribute("aria-expanded") === "true"
  ) {
    setProfileMenuOpen(false);
    profileButton.focus();
  }
});
