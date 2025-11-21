export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  fen: string;
  createdAt: string;
  status: "WAITING" | "PLAYING" | "FINISHED";

  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;

  whiteUsername?: string;
  blackUsername?: string;

  lastMoveAt: string | null;

  winnerId: string | null;

  moveHistory: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
