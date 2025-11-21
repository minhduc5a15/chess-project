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
    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-[600px] h-48 flex flex-col mt-6">
      <div className="bg-gray-800 px-4 py-2 font-bold border-b border-gray-700 text-gray-300 text-sm uppercase tracking-wider">
        Lịch sử ván đấu
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <table className="w-full text-left border-collapse text-sm font-mono">
          <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="py-2 pl-4 w-12">#</th>
              <th className="py-2">White</th>
              <th className="py-2">Black</th>
            </tr>
          </thead>
          <tbody>
            {movePairs.map((pair) => (
              <tr
                key={pair.number}
                className="hover:bg-gray-800/50 transition-colors border-b border-gray-800/30 last:border-0"
              >
                <td className="py-1.5 pl-4 text-gray-500">{pair.number}.</td>
                <td className="py-1.5 font-medium text-green-400">
                  {pair.white}
                </td>
                <td className="py-1.5 font-medium text-yellow-400">
                  {pair.black}
                </td>
              </tr>
            ))}
            {movePairs.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-gray-600 italic"
                >
                  Ván đấu chưa bắt đầu
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
