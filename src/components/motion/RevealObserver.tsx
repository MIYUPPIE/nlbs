"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One observer for the whole site. Server components opt in with a
 * `data-reveal` attribute; this marks them `data-visible` as they enter the
 * viewport. The hidden state only applies once `html.js` is set, so content
 * is fully visible without JavaScript and under reduced motion (see CSS).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.setAttribute("data-visible", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
