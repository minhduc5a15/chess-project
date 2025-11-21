import { useNavigate } from "react-router-dom";

interface GameOverModalProps {
  winnerId: string | null; // null = Hòa
  myId: string;
  reason?: string; // (Tùy chọn) Lý do: "Checkmate", "Timeout"...
  onClose: () => void; // Hàm đóng modal để xem lại bàn cờ
}

const GameOverModal = ({ winnerId, myId, onClose }: GameOverModalProps) => {
  const navigate = useNavigate();

  // Xác định kết quả
  const isDraw = winnerId === null;
  const isWinner = winnerId === myId;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border-2 border-gray-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform scale-100">
        {/* Icon / Emoji kết quả */}
        <div className="text-6xl mb-4">
          {isDraw ? "🤝" : isWinner ? "🏆" : "💀"}
        </div>

        <h2 className="text-4xl font-bold mb-2">
          {isDraw ? (
            <span className="text-yellow-500">HÒA CỜ!</span>
          ) : isWinner ? (
            <span className="text-green-500">BẠN THẮNG!</span>
          ) : (
            <span className="text-red-500">BẠN THUA!</span>
          )}
        </h2>

        <p className="text-gray-400 mb-8">
          {isDraw
            ? "Ván đấu kết thúc với tỉ số hòa."
            : isWinner
            ? "Chúc mừng! Bạn đã chiến thắng ván đấu này."
            : "Đừng buồn, hãy thử lại ở ván sau nhé."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-white transition-colors"
          >
            Về Sảnh Chờ
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-gray-300 transition-colors border border-gray-700"
          >
            Xem lại bàn cờ
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
