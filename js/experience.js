export function initExperience() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const list = document.querySelector(".experience-list");
  if (list) {
    const entries = [...list.querySelectorAll(":scope > .experience-entry")];
    // Connect actual heading centres, including wrapped mobile titles and dates.
    const updateTimeline = () => {
      const gap = parseFloat(getComputedStyle(list).rowGap);
      const offsets = entries.map((entry) => {
        const heading = entry.querySelector(".experience-entry-heading").getBoundingClientRect();
        return heading.top + heading.height / 2 - entry.getBoundingClientRect().top;
      });
      entries.slice(0, -1).forEach((entry, index) => {
        entry.style.setProperty("--timeline-start", offsets[index] + "px");
        entry.style.setProperty("--timeline-end", -(gap + offsets[index + 1]) + "px");
      });
    };
    const timelineObserver = new ResizeObserver(updateTimeline);
    list.querySelectorAll(".experience-entry-heading, .experience-dates").forEach((element) => {
      timelineObserver.observe(element);
    });
    updateTimeline();
  }

  document.querySelectorAll("details.experience-card").forEach((card) => {
    const summary = card.querySelector(":scope > summary");
    const content = card.querySelector(":scope > .experience-card-content");
    const body = content?.querySelector(".experience-card-body");
    if (!summary || !content || !body) return;
    let targetOpen = card.open;
    let animation;
    let targetHeight;

    function syncState() {
      summary.setAttribute("aria-expanded", String(targetOpen));
      content.inert = !targetOpen;
    }

    function finish() {
      const previous = animation;
      animation = null;
      targetHeight = null;
      card.open = targetOpen;
      syncState();
      previous?.cancel();
    }

    function animateTo(open) {
      const from = card.open ? content.getBoundingClientRect().height : 0;
      animation?.cancel();
      animation = null;
      targetOpen = open;
      syncState();
      // Keep native details content visible until the closing animation finishes.
      card.open = true;
      targetHeight = open ? content.getBoundingClientRect().height : 0;
      if (reducedMotion.matches || !content.animate || !card.getClientRects().length ||
          Math.abs(from - targetHeight) < 0.5) {
        finish();
        return;
      }
      const current = content.animate(
        [{ height: from + "px" }, { height: targetHeight + "px" }],
        { duration: 220, easing: "ease", fill: "both" }
      );
      animation = current;
      current.onfinish = () => {
        if (animation === current) finish();
      };
    }

    summary.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      event.preventDefault();
      animateTo(!targetOpen);
    });
    card.addEventListener("toggle", () => {
      if (animation) return;
      targetOpen = card.open;
      syncState();
    });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches && animation) finish();
    });

    // Recalculate an expanding card if viewport or sidebar resizing reflows its text.
    const observer = new ResizeObserver(() => {
      if (!animation || !targetOpen) return;
      const style = getComputedStyle(body);
      const natural = body.getBoundingClientRect().height +
        parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      if (Math.abs(natural - targetHeight) > 1) animateTo(true);
    });
    observer.observe(body);
    syncState();
  });
}