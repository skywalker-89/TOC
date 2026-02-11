const API_BASE_URL = "https://toc-yrr0.onrender.com";

import { PlayersResponse, Stats } from "@/types";

export async function fetchPlayers(
  search: string = "",
  page: number = 1,
  limit: number = 20
): Promise<PlayersResponse> {
  const params = new URLSearchParams({
    search,
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`${API_BASE_URL}/players?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE_URL}/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
