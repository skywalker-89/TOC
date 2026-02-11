"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, PaginationInfo } from "@/types";
import { fetchPlayers } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import PlayerTable from "@/components/PlayerTable";
import PlayerCards from "@/components/PlayerCards";
import Pagination from "@/components/Pagination";
import ViewToggle from "@/components/ViewToggle";

const GITHUB_REPO_URL = "https://github.com/YOUR_USERNAME/premier-league-explorer";

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPlayers(search, currentPage, 20);
      setPlayers(data.players);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load players"
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full
                          bg-white/[0.02] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full
                          bg-white/[0.015] blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          {/* Nav Bar */}
          <nav className="flex items-center justify-between mb-20 animate-fade-in opacity-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚽</span>
              <span className="text-sm font-semibold tracking-tight">PL Explorer</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           border border-border hover:border-border-hover
                           text-xs font-medium text-muted hover:text-white
                           transition-all duration-300"
                id="github-link"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                            border border-border bg-card mb-8
                            animate-fade-in-up opacity-0 stagger-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              <span className="text-xs font-medium text-muted">
                {pagination.total} players scraped via regex
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight
                         leading-[1.1] mb-6
                         animate-fade-in-up opacity-0 stagger-2"
            >
              Premier League
              <br />
              <span className="text-transparent bg-clip-text
                               bg-gradient-to-r from-white via-white to-muted">
                Player Explorer
              </span>
            </h1>

            <p className="text-muted text-base sm:text-lg max-w-xl mx-auto mb-10
                          leading-relaxed animate-fade-in-up opacity-0 stagger-3">
              A Theory of Computation project. Player data extracted from Wikipedia using
              Python regular expressions — no HTML parsers involved.
            </p>

            {/* Search */}
            <SearchBar
              value={search}
              onChange={handleSearch}
              totalResults={pagination.total}
            />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r
                        from-transparent via-border to-transparent" />
      </section>

      {/* ============================================
          CONTENT SECTION
          ============================================ */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} />
            {!isLoading && (
              <span className="text-xs text-muted animate-fade-in">
                {pagination.total} players
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl border border-red-900/50 bg-red-950/20
                          animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-sm">⚠</span>
              <div>
                <p className="text-sm text-red-400 font-medium">
                  Failed to load players
                </p>
                <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
              </div>
              <button
                onClick={loadPlayers}
                className="ml-auto px-3 py-1.5 rounded-lg border border-red-900/50
                           text-xs text-red-400 hover:bg-red-950/30
                           transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Player Data */}
        {view === "table" ? (
          <PlayerTable players={players} isLoading={isLoading} />
        ) : (
          <PlayerCards players={players} isLoading={isLoading} />
        )}

        {/* Pagination */}
        <div className="mt-8">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>⚽</span>
              <span>Premier League Player Explorer</span>
              <span className="text-border">·</span>
              <span>TOC Course Project</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>Built with FastAPI + Next.js + Python Regex</span>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
