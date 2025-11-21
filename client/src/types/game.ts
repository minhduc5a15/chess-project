export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  fen: string;
  createdAt: string;
  status: "WAITING" | "PLAYING" | "FINISHED";

  whiteTimeRemainingMs: number;
  blackTimeRemainingMs: number;
  lastMoveAt: string | null;

  winnerId: string | null;

  moveHistory: string;
}

