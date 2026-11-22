(() => {
  if (new URLSearchParams(window.location.search).get("project") !== "urban-cms") return;
  document.title = "Project unavailable - Vlad Vovk";
  document.querySelector(".section-eyebrow").textContent = "404 · Urban CMS";
  document.querySelector("h1").textContent = "This project is not publicly available.";
  const link = document.querySelector(".back-home-link");
  link.textContent = "Back";
  link.href = "index.html#projects";
})();
