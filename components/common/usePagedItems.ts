"use client";

import { useRef, useState } from "react";

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

// Avstand fra toppen av vinduet (AppShell-headeren er 60px høy) tabellen skal stoppe på når vi hopper opp til den.
const SCROLL_MARGIN_TOP = 72;

// Klientside-paginering av en ferdig filtrert liste. Siden klemmes til gyldig område, så et filter som gir færre
// treff aldri etterlater en tom side. Sidestørrelsen kan endres (PAGE_SIZE_OPTIONS).
//
// `containerProps` settes på et element som omslutter tabellen (og sidevelgerne): når man bytter side nederst på en lang
// side, blir scrollposisjonen liggende nederst — da hopper vi opp til toppen av tabellen (kun hvis den er scrollet ut av syne).
export const usePagedItems = <T>(items: T[], defaultPageSize: number) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  const goToPage = (next: number) => {
    setPage(next);

    const container = containerRef.current;
    if (container && container.getBoundingClientRect().top < SCROLL_MARGIN_TOP) {
      container.scrollIntoView({ block: "start" });
    }
  };

  const changePageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    visibleItems: items.slice(start, start + pageSize),
    currentPage,
    pageSize,
    goToPage,
    changePageSize,
    containerProps: { ref: containerRef, style: { scrollMarginTop: SCROLL_MARGIN_TOP } },
  };
};
