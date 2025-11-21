import ChessClock from "./board/chess-clock";

interface PlayerCardProps {
  username: string;
  color: "w" | "b";
  timeMs: number;
  isActive: boolean;
  lastMoveAt?: string;
  isCurrentUser: boolean;
  avatarUrl?: string;
}

const PlayerCard = ({
  username,
  color,
  timeMs,
  isActive,
  lastMoveAt,
  isCurrentUser,
  avatarUrl,
}: PlayerCardProps) => {
  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500 shadow-lg shadow-amber-500/20"
          : "bg-slate-900/50 border-slate-700/50"
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
          isActive ? "border-amber-400" : "border-slate-600"
        }`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-2xl font-bold ${
              color === "w"
                ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800"
                : "bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200"
            }`}
          >
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Color indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
            color === "w" ? "bg-slate-100" : "bg-slate-800"
          }`}
        />
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={`font-semibold truncate ${
              isCurrentUser ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            {username}
          </h3>
          {isCurrentUser && (
            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {color === "w" ? "White pieces" : "Black pieces"}
        </div>
      </div>

      {/* Clock */}
      <div className="flex-shrink-0">
        <ChessClock
          timeMs={timeMs}
          isActive={isActive}
          lastMoveAt={lastMoveAt}
          color={color}
        />
      </div>

      {/* Active indicator glow */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/5 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default PlayerCard;
