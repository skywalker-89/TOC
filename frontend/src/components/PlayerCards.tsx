"use client";

import { Player } from "@/types";

interface PlayerCardsProps {
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

export default function PlayerCards({ players, isLoading }: PlayerCardsProps) {
  if (isLoading) {
    return <CardsSkeleton />;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player, index) => (
        <a
          key={player.wikipedia_url}
          href={player.wikipedia_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-5 rounded-2xl border border-border bg-card
                     hover:bg-card-hover hover:border-border-hover
                     transition-all duration-300 glow-hover
                     animate-fade-in-up opacity-0"
          style={{ animationDelay: `${index * 50}ms` }}
          id={`player-card-${index}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate
                             group-hover:text-white/90 transition-colors">
                {player.full_name || player.name}
              </h3>
              {player.full_name && player.full_name !== player.name && (
                <p className="text-xs text-muted mt-0.5 truncate">
                  {player.name}
                </p>
              )}
            </div>
            {player.position && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full
                               text-[10px] font-medium bg-border text-muted-foreground
                               whitespace-nowrap shrink-0">
                {player.position}
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="space-y-2.5">
            <InfoRow icon="📅" label="Born" value={formatDate(player.date_of_birth)} />
            <InfoRow icon="📍" label="Place" value={player.place_of_birth} />
            <InfoRow icon="📏" label="Height" value={player.height} />
            <InfoRow icon="🌍" label="Nation" value={player.nationality} />
          </div>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center text-muted group-hover:text-white/60
                          transition-all duration-300">
            <span className="text-xs">Wikipedia →</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-center text-[10px]">{icon}</span>
      <span className="text-muted w-12 shrink-0">{label}</span>
      <span className="text-muted-foreground truncate">
        {value || "—"}
      </span>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-border bg-card animate-fade-in opacity-0"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="skeleton h-3 w-3 rounded" />
                <div className="skeleton h-3 w-10 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
