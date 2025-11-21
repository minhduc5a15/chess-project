export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  fen: string;
  createdAt: string;
  status: "WAITING" | "PLAYING" | "FINISHED";
  whiteUsername?: string | null;
  blackUsername?: string | null;

  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;
<<<<<<< HEAD
  incrementMs?: number;
=======

  whiteUsername?: string;
  blackUsername?: string;

>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
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
