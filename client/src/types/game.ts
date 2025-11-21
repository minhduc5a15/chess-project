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
  incrementMs?: number;
  lastMoveAt: string | null;

  winnerId: string | null;

  moveHistory: string;
}

