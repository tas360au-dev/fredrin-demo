export function initCat() {
  const cat = document.querySelector(".about-illustration");
  const speech = document.getElementById("cat-speech");
  const illustration = cat?.querySelector(".animated-cat");
  const setLayout = (isMobile) => {
    illustration?.setAttribute("preserveAspectRatio", isMobile ? "xMidYMid meet" : "xMaxYMid meet");
  };
  if (!cat || !speech) return { setLayout };

  const phrases = [
    "Bloody good startup!", "Purr request approved", "Meow or never!",
    "Hire my human", "No bugs. Just features", "Powered by coffee",
    "I live in Meowai", "Ctrl + Meow", "Trust the paws", "Ship it!"
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const speechDuration = 3500;
  let phraseIndex = 0;
  let speechTimer;
  let finaleTimer;
  let state = "idle";

  function hideSpeech() {
    window.clearTimeout(speechTimer);
    speech.classList.remove("is-visible");
  }

  function showSpeech(text) {
    hideSpeech();
    speech.textContent = text;
    speech.classList.add("is-visible");
  }

  function finishFinale() {
    cat.classList.remove("is-finale");
    state = "idle";
    phraseIndex = 0;
  }

  async function reverseAnimation(animation) {
    if (!animation) return;
    const { delay, duration } = animation.effect.getTiming();
    const elapsed = Math.max(0, Math.min(Number(duration), Number(animation.currentTime ?? 0) - delay));
    animation.pause();
    animation.effect.updateTiming({ delay: 0 });
    animation.currentTime = elapsed;
    if (elapsed === 0) return;
    animation.reverse();
    // Reverse from the current frame, including when the next click interrupts the turn.
    await animation.finished.catch(() => {});
  }

  async function returnToIdle() {
    if (state === "idle" || state === "returning") return;
    state = "returning";
    window.clearTimeout(finaleTimer);
    hideSpeech();
    const head = cat.querySelector(".cat-finale-head")?.getAnimations()[0];
    const glasses = cat.querySelector(".cat-glasses")?.getAnimations()[0];
    head?.pause();
    await reverseAnimation(glasses);
    await reverseAnimation(head);
    finishFinale();
  }

  function startFinale() {
    hideSpeech();
    state = "turning";
    cat.classList.add("is-finale");
    finaleTimer = window.setTimeout(() => {
      state = "question";
      showSpeech("So... are we hired?");
      finaleTimer = window.setTimeout(returnToIdle, speechDuration);
    }, reducedMotion.matches ? 150 : 1100);
  }

  function speak() {
    if (state === "turning" || state === "returning") return;
    if (state === "question") {
      returnToIdle();
      return;
    }
    if (phraseIndex === phrases.length) {
      startFinale();
      return;
    }
    showSpeech(phrases[phraseIndex]);
    phraseIndex += 1;
    speechTimer = window.setTimeout(hideSpeech, speechDuration);
  }

  cat.addEventListener("click", speak);
  cat.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      speak();
    }
    if (event.key === "Escape") {
      if (state !== "idle") returnToIdle();
      else hideSpeech();
    }
  });
  return { setLayout };
}
