import { useEffect, useState } from "react";

export function useScrollSpy(ids, { rootMargin = "-30% 0px -60% 0px" } = {}) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin, threshold: [0.2, 0.5, 0.8] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids, rootMargin]);

  return active;
}
