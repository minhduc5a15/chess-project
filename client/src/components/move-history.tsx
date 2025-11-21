import { useEffect, useRef } from "react";

interface MoveHistoryProps {
  history: string; 
}

const MoveHistory = ({ history }: MoveHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tách chuỗi thành mảng các nước đi
  const moves = history
    .trim()
    .split(" ")
    .filter((m) => m !== "");

  // Nhóm thành từng cặp (Trắng - Đen) để hiển thị: "1. e2e4 e7e5"
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1] || "",
    });
  }

  // Tự động cuộn xuống dưới cùng khi có nước mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-[600px] h-40 flex flex-col">
      <div className="bg-gray-800 px-4 py-2 font-bold border-b border-gray-700 text-gray-300">
        Lịch sử nước đi
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 text-sm font-mono scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="py-1 w-10">#</th>
              <th className="py-1">Trắng</th>
              <th className="py-1">Đen</th>
            </tr>
          </thead>
          <tbody>
            {movePairs.map((pair) => (
              <tr
                key={pair.number}
                className="hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-1 text-gray-500">{pair.number}.</td>
                <td className="py-1 text-green-400">{pair.white}</td>
                <td className="py-1 text-yellow-400">{pair.black}</td>
              </tr>
            ))}
            {movePairs.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-gray-600 italic"
                >
                  Chưa có nước đi nào
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
