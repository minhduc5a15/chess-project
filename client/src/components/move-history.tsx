"use client";

import { useEffect, useRef } from "react";

interface MoveHistoryProps {
  history: string; // Chuỗi dạng "e2e4 e7e5 g1f3 ..."
}

const MoveHistory = ({ history }: MoveHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tách chuỗi thành mảng các nước đi, bỏ qua chuỗi rỗng
  const moves = history
    ? history
        .trim()
        .split(" ")
        .filter((m) => m !== "")
    : [];

  // Nhóm thành từng cặp (Trắng - Đen) để hiển thị: "1. e2e4 e7e5"
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1] || "",
    });
  }

  // Tự động cuộn xuống dòng cuối cùng khi có nước đi mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full h-full flex flex-col shadow-lg overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 font-bold border-b border-slate-800 text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        Move History
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-950/30"
      >
        <table className="w-full text-left border-collapse text-sm font-mono">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-sm">
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="py-2 pl-4 w-12 font-medium">#</th>
              <th className="py-2 font-medium">White</th>
              <th className="py-2 font-medium">Black</th>
            </tr>
          </thead>
          <tbody>
            {movePairs.map((pair) => (
              <tr
                key={pair.number}
                className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 last:border-0 group"
              >
                <td className="py-2 pl-4 text-slate-500 group-hover:text-slate-400">
                  {pair.number}.
                </td>
                <td className="py-2 font-medium text-slate-200 group-hover:text-white">
                  <span className="bg-slate-800/50 px-2 py-0.5 rounded text-slate-200 group-hover:bg-slate-700 transition-colors">
                    {pair.white}
                  </span>
                </td>
                <td className="py-2 font-medium text-slate-200 group-hover:text-white">
                  {pair.black && (
                    <span className="bg-slate-800/50 px-2 py-0.5 rounded text-slate-200 group-hover:bg-slate-700 transition-colors">
                      {pair.black}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {movePairs.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-slate-600 italic"
                >
                  Game has not started yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoveHistory;
