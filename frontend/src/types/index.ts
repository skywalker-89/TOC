export interface Player {
  name: string;
  full_name: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  height: string | null;
  position: string | null;
  nationality: string | null;
  wikipedia_url: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PlayersResponse {
  players: Player[];
  pagination: PaginationInfo;
}

export interface Stats {
  total_players: number;
  with_date_of_birth: number;
  with_height: number;
  positions: Record<string, number>;
  nationalities: Record<string, number>;
}
