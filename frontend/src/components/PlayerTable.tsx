"use client";

import { Player } from "@/types";

interface PlayerTableProps {
  players: Player[];
  isLoading: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PlayerTable({ players, isLoading }: PlayerTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-4">⚽</div>
        <p className="text-muted text-lg">No players found</p>
        <p className="text-muted text-sm mt-1">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto animate-fade-in">
      <table className="w-full text-sm" id="players-table">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider">
              #
            </th>
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider">
              Name
            </th>
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider hidden sm:table-cell">
              Position
            </th>
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider hidden md:table-cell">
              Date of Birth
            </th>
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider hidden lg:table-cell">
              Birthplace
            </th>
            <th className="pb-4 pr-4 text-xs font-medium text-muted uppercase tracking-wider hidden md:table-cell">
              Height
            </th>
            <th className="pb-4 text-xs font-medium text-muted uppercase tracking-wider hidden sm:table-cell">
              Nationality
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.wikipedia_url}
              className="border-b border-border/50 hover:bg-card-hover transition-colors
                         duration-200 group animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <td className="py-4 pr-4 text-muted text-xs font-mono">
                {index + 1}
              </td>
              <td className="py-4 pr-4">
                <a
                  href={player.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:underline
                             decoration-border-hover underline-offset-4
                             transition-all duration-200"
                >
                  {player.full_name || player.name}
                </a>
                {player.full_name && player.full_name !== player.name && (
                  <p className="text-xs text-muted mt-0.5">{player.name}</p>
                )}
              </td>
              <td className="py-4 pr-4 hidden sm:table-cell">
                {player.position ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                   text-xs font-medium bg-border text-muted-foreground">
                    {player.position}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="py-4 pr-4 text-muted-foreground hidden md:table-cell">
                {formatDate(player.date_of_birth)}
              </td>
              <td className="py-4 pr-4 text-muted-foreground text-xs hidden lg:table-cell max-w-[200px] truncate">
                {player.place_of_birth || "—"}
              </td>
              <td className="py-4 pr-4 text-muted-foreground hidden md:table-cell font-mono text-xs">
                {player.height || "—"}
              </td>
              <td className="py-4 text-muted-foreground hidden sm:table-cell">
                {player.nationality || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-3 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-4 border-b border-border">
        {[60, 180, 100, 120, 150, 80, 100].map((w, i) => (
          <div key={i} className="skeleton h-4 rounded" style={{ width: w }} />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-border/30">
          <div className="skeleton h-4 w-6 rounded" />
          <div className="skeleton h-4 w-44 rounded" />
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}
