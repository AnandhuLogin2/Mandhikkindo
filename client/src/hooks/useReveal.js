import { useEffect } from "react";

/**
 * Observes all [data-reveal] elements currently in the DOM and toggles
 * `is-visible` when they enter the viewport. Re-runs whenever `deps`
 * change so newly rendered cards get observed too.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not(.is-visible)");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || 0;
            setTimeout(() => entry.target.classList.add("is-visible"), Number(delay));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
