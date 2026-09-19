"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "offices", label: "Offices" },
  { id: "memory", label: "Memory" },
  { id: "claims", label: "Claims" },
  { id: "projects", label: "Projects" },
  { id: "money", label: "Money" },
  { id: "related", label: "Related" },
  { id: "sources", label: "Sources" },
];

export function ProfileGuideNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-[4.5rem] z-30 border-y border-paper-border bg-paper/92 backdrop-blur-md"
    >
      <div className="site-container">
        <ul className="flex gap-0.5 overflow-x-auto py-2.5 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className={clsx(
                  "block border-b-2 px-3.5 py-1.5 no-underline transition",
                  active === s.id
                    ? "border-civic-green font-medium text-civic-green"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
