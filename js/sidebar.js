import { isPlainClick } from "./navigation.js";

export function initSidebar(navigation) {
  const toggle = document.querySelector(".personal-row");
  const projects = document.getElementById("sidebar-projects");
  if (!toggle || !projects) return;

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    projects.hidden = isExpanded;
  });

  projects.querySelector(".project-row")?.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    navigation.navigate("projects");
  });
}
