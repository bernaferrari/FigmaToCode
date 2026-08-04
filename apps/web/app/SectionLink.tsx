"use client";

import type { MouseEvent, ReactNode } from "react";

type SectionLinkProps = {
  section: string;
  className?: string;
  children: ReactNode;
};

export function SectionLink({
  section,
  className,
  children,
}: SectionLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      window.location.pathname !== "/"
    ) {
      return;
    }

    event.preventDefault();

    const nextUrl = new URL(window.location.href);
    nextUrl.hash = section;

    const method =
      window.location.hash === `#${section}` ? "replaceState" : "pushState";
    window.history[method](
      window.history.state,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
    );
    document.getElementById(section)?.scrollIntoView();
  }

  return (
    <a className={className} href={`/#${section}`} onClick={handleClick}>
      {children}
    </a>
  );
}
