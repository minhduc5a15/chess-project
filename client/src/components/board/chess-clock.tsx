import { useEffect, useState, useRef } from "react";

interface ChessClockProps {
  timeMs: number;
  isActive: boolean;
  lastMoveAt?: string;
  color: "w" | "b";
}

const ChessClock = ({
  timeMs,
  isActive,
  lastMoveAt,
  color,
}: ChessClockProps) => {
  const [displayTime, setDisplayTime] = useState(timeMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2. Đồng bộ khi dữ liệu Server thay đổi (timeMs hoặc lastMoveAt mới)
  useEffect(() => {
    // 1. Logic tính toán thời gian hiện tại
    const calculateCurrentTime = () => {
      if (!lastMoveAt) return timeMs;
      const now = new Date().getTime();
      const lastMoveTime = new Date(lastMoveAt).getTime();
      const elapsed = now - lastMoveTime;
      return Math.max(0, timeMs - elapsed);
    };

    if (isActive) {
      // Nếu đang chạy, tính toán lại dựa trên lastMoveAt
      setDisplayTime(calculateCurrentTime());
    } else {
      setDisplayTime(timeMs);
    }
  }, [timeMs, lastMoveAt, isActive]);

  // 3. Chạy đồng hồ
  useEffect(() => {
    if (isActive && displayTime > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setDisplayTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
    } else {
      // Dừng đồng hồ
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [displayTime, isActive]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg text-xl font-mono font-bold shadow-md transition-all border-2 ${
        isActive
          ? "bg-yellow-500 text-black scale-110 shadow-yellow-500/50 border-white"
          : "bg-gray-800 text-gray-400 border-gray-700 opacity-80"
      } ${color === "w" && isActive ? "bg-white/90 text-black" : ""} ${
        color === "b" && isActive ? "bg-black/90 text-white" : ""
      }`}
    >
      {formatTime(displayTime)}
    </div>
  );
};

export default ChessClock;
