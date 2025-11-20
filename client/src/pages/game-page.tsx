import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import { type Game } from "../types/game";
import { useAuthStore } from "../stores/auth-store";
import { useSignalR } from "../hooks/useSignalR";
import ChessBoard from "../components/chess-board";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Khởi tạo SignalR
  const { connection, isConnected } = useSignalR(
    "https://localhost:7219/hub/chess"
  );

  // Dùng ref để đảm bảo chỉ Join phòng 1 lần
  const hasJoinedRoom = useRef(false);

  // 2. Load thông tin game ban đầu từ API
  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        const data = await gameApi.getGame(gameId);
        setGame(data);
      } catch (error) {
        console.error(error);
        alert("Không tìm thấy phòng game!");
        navigate("/");
      } finally {
        // QUAN TRỌNG: Phải tắt loading dù thành công hay thất bại
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, navigate]);

  // 3. Xử lý sự kiện SignalR
  useEffect(() => {
    // Chỉ chạy khi đã kết nối và có gameId
    if (connection && isConnected && gameId) {
      // A. Logic Join Phòng (Chạy 1 lần)
      if (!hasJoinedRoom.current) {
        connection
          .invoke("JoinGame", gameId)
          .then(() => {
            console.log("SignalR: Đã vào phòng", gameId);
            hasJoinedRoom.current = true;
          })
          .catch((err) => console.error("SignalR Join Error:", err));
      }

      // B. Lắng nghe sự kiện (UpdateBoard)
      // Backend gửi: await Clients.Group(gameId).SendAsync("UpdateBoard", game.FEN);
      const handleUpdateBoard = (newFen: string) => {
        console.log("Server cập nhật FEN:", newFen);
        if (!newFen) return;

        setGame((prev) => {
          if (!prev) return null;
          return { ...prev, fen: newFen };
        });
      };

      connection.on("UpdateBoard", handleUpdateBoard);

      // Cleanup: Hủy lắng nghe khi component unmount hoặc dependency đổi
      return () => {
        connection.off("UpdateBoard", handleUpdateBoard);
      };
    }
  }, [connection, isConnected, gameId]);

  // 4. Hàm gửi nước đi
  const handleMove = async (
    move: { from: string; to: string; promotion?: string },
    newFen: string
  ) => {
    if (!connection || !isConnected || !gameId) return;

    const moveUCI = `${move.from}${move.to}${move.promotion || ""}`;
    try {
      // Gửi nước đi lên server
      await connection.invoke("SendMove", gameId, moveUCI, newFen);
    } catch (error) {
      console.error("Lỗi gửi nước đi:", error);
    }
  };

  // Render Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Đang tải bàn cờ...
      </div>
    );
  }

  if (!game || !user) return null;

  // Xác định màu quân
  const myColor =
    user.id === game.whitePlayerId
      ? "w"
      : user.id === game.blackPlayerId
      ? "b"
      : "spectator";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white flex items-center gap-1"
        >
          <span>←</span> Sảnh chờ
        </button>

        <div className="font-bold flex items-center gap-3">
          <span className="bg-gray-800 px-3 py-1 rounded border border-gray-700">
            Phòng:{" "}
            <span className="font-mono text-blue-400">
              {gameId?.substring(0, 8)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isConnected ? (
            <span className="text-green-500">● Online</span>
          ) : (
            <span className="text-red-500 animate-pulse">● Connecting...</span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <ChessBoard fen={game.fen} myColor={myColor} onMove={handleMove} />

        <div className="mt-8 flex justify-center gap-12 w-full max-w-[600px]">
          <div
            className={`flex flex-col items-center gap-2 transition-all ${
              game.whitePlayerId === user.id ? "scale-110" : "opacity-70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                game.whitePlayerId === user.id
                  ? "bg-gray-200 text-black border-green-500"
                  : "bg-gray-700 border-gray-600"
              }`}
            >
              W
            </div>
            <span
              className={`text-sm ${
                game.whitePlayerId === user.id
                  ? "text-green-400 font-bold"
                  : "text-gray-400"
              }`}
            >
              {game.whitePlayerId === user.id
                ? "Bạn (Trắng)"
                : "Đối thủ (Trắng)"}
            </span>
          </div>

          <div
            className={`flex flex-col items-center gap-2 transition-all ${
              game.blackPlayerId === user.id ? "scale-110" : "opacity-70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                game.blackPlayerId === user.id
                  ? "bg-black text-white border-green-500"
                  : "bg-gray-800 border-gray-600"
              }`}
            >
              B
            </div>
            <span
              className={`text-sm ${
                game.blackPlayerId === user.id
                  ? "text-green-400 font-bold"
                  : "text-gray-400"
              }`}
            >
              {game.blackPlayerId === user.id
                ? "Bạn (Đen)"
                : !game.blackPlayerId
                ? "Đang chờ..."
                : "Đối thủ (Đen)"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
