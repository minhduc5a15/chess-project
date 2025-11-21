import { useNavigate } from "react-router-dom";

interface GameOverModalProps {
  winnerId: string | null; // null = Hòa
  myId: string;
  whitePlayer: { id: string; username: string };
  blackPlayer: { id: string; username: string };
  onClose: () => void;
}

const GameOverModal = ({
  winnerId,
  myId,
  whitePlayer,
  blackPlayer,
  onClose,
}: GameOverModalProps) => {
  const navigate = useNavigate();

  // Logic xác định kết quả
  const isDraw = winnerId === null;
  const isParticipant = myId === whitePlayer.id || myId === blackPlayer.id;

  // Nếu là người chơi
  const isWinner = isParticipant && winnerId === myId;

  // Nếu là người xem (spectator)
  const winnerName =
    winnerId === whitePlayer.id ? whitePlayer.username : blackPlayer.username;

  // Nội dung hiển thị
  let title = "";
  let message = "";
  let colorClass = "";

  if (isDraw) {
    title = "🤝 HÒA CỜ!";
    message = "Ván đấu kết thúc với tỉ số hòa.";
    colorClass = "text-yellow-500";
  } else if (isParticipant) {
    if (isWinner) {
      title = "🏆 BẠN THẮNG!";
      message = "Chúc mừng! Bạn đã chiến thắng ván đấu này.";
      colorClass = "text-green-500";
    } else {
      title = "💀 BẠN THUA!";
      message = "Đừng buồn, hãy thử lại ở ván sau nhé.";
      colorClass = "text-red-500";
    }
  } else {
    // Dành cho người xem lại lịch sử
    title = `🎉 ${winnerName} THẮNG!`;
    message = `Người chơi ${winnerName} đã giành chiến thắng.`;
    colorClass = "text-blue-400";
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border-2 border-gray-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform scale-100">
        <div className="text-6xl mb-4">
          {isDraw ? "🤝" : isWinner ? "🏆" : isParticipant ? "💀" : "👑"}
        </div>

        <h2 className={`text-4xl font-bold mb-2 ${colorClass}`}>{title}</h2>

        <p className="text-gray-400 mb-8">{message}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-white transition-colors cursor-pointer"
          >
            Về Sảnh Chờ
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-gray-300 transition-colors border border-gray-700 cursor-pointer"
          >
            Xem lại bàn cờ
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
