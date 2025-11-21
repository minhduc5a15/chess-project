import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import { type Game } from "../types/game";
import { useAuthStore } from "../stores/auth-store";
import { useSignalR } from "../hooks/useSignalR";
import ChessBoard from "../components/chess-board";
import ChessClock from "../components/board/chess-clock";
import { Chess } from "chess.js";
import GameOverModal from "../components/game-over-modal";
import MoveHistory from "../components/move-history";
import { type ChatMessage } from "../types/chat";
import ChatBox from "../components/chat-box";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { connection, isConnected } = useSignalR(
    "https://localhost:7219/hub/chess"
  );
  const hasJoinedRoom = useRef(false);

  // Hàm lấy dữ liệu game mới nhất
  const fetchGameData = useCallback(async () => {
    if (!gameId) return;
    try {
      const data = await gameApi.getGame(gameId);
      setGame(data);
      // Debug: Kiểm tra xem winnerId có về không
      if (data.status === "FINISHED") {
        console.log("Game Finished. Winner:", data.winnerId);
      }
    } catch (error) {
      console.error("Lỗi tải game:", error);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const initData = async () => {
      try {
        const [gameData, chatData] = await Promise.all([
          gameApi.getGame(gameId),
          gameApi.getMessages(gameId), // Gọi song song
        ]);
        setGame(gameData);
        setMessages(chatData);
      } catch {
        alert("Lỗi tải dữ liệu phòng!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [gameId, navigate]);

  // Load ban đầu
  useEffect(() => {
    if (!gameId) return;
    const initGame = async () => {
      try {
        const data = await gameApi.getGame(gameId);
        setGame(data);
      } catch {
        alert("Không tìm thấy phòng!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    initGame();
  }, [gameId, navigate]);

  useEffect(() => {
    if (game?.status === "WAITING") {
      const interval = setInterval(fetchGameData, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchGameData, game?.status]);

  // Xử lý SignalR
  useEffect(() => {
    if (connection && isConnected && gameId) {
      if (!hasJoinedRoom.current) {
        connection
          .invoke("JoinGame", gameId)
          .then(() => {
            console.log("Đã vào phòng SignalR");
            hasJoinedRoom.current = true;
          })
          .catch(console.error);
      }

      const handleUpdateBoard = () => {
        console.log("Nhận nước đi mới. Đang đồng bộ...");
        fetchGameData(); // Lấy lại toàn bộ dữ liệu chuẩn từ server
      };

      const handleReceiveMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      }

      connection.on("UpdateBoard", handleUpdateBoard);
      connection.on("ReceiveMessage", handleReceiveMessage);
      return () => {
        connection.off("UpdateBoard", handleUpdateBoard);
        connection.off("ReceiveMessage", handleReceiveMessage);
      };
    }
  }, [connection, isConnected, gameId, fetchGameData]);

  // Hiện modal kết thúc
  useEffect(() => {
    if (game?.status === "FINISHED") {
      // Delay nhẹ để người dùng nhìn thấy nước đi cuối cùng trước khi hiện bảng
      setTimeout(() => setShowModal(true), 500);
    }
  }, [game?.status]);

  // Hàm xử lý nước đi
  const handleMove = async (
    move: { from: string; to: string; promotion?: string },
    newFen: string
  ) => {
    if (!connection || !isConnected || !gameId) return;

    setGame((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fen: newFen,
        // Giả lập cập nhật thời gian LastMoveAt thành "ngay bây giờ"
        // Điều này sẽ khiến ChessClock tính toán lại và dừng chạy
        lastMoveAt: new Date().toISOString(),
      };
    });

    const moveUCI = `${move.from}${move.to}${move.promotion || ""}`;
    try {
      await connection.invoke("SendMove", gameId, moveUCI, newFen);
    } catch (error) {
      console.error("Lỗi gửi:", error);
      fetchGameData();
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!connection || !isConnected || !gameId || !user) return;
    try {
      // Server hub expects (gameId, messageContent)
      await connection.invoke("SendMessage", gameId, content);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!game || !user) return null;

  const myColor =
    user.id === game.whitePlayerId
      ? "w"
      : user.id === game.blackPlayerId
      ? "b"
      : "spectator";
  const currentTurn = new Chess(game.fen).turn();
  const isGamePlaying = game.status === "PLAYING";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white"
        >
          ← Sảnh chờ
        </button>
        <div className="font-bold">
          Phòng:{" "}
          <span className="text-blue-400">{gameId?.substring(0, 8)}</span>
        </div>
        <div className="text-xs flex items-center gap-2">
          {isConnected ? (
            <span className="text-green-500">● Online</span>
          ) : (
            <span className="text-red-500">● Offline</span>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto w-full max-w-[1100px] flex flex-col md:flex-row items-start gap-6">
          {/* Left: Board + Clocks + MoveHistory */}
          <div className="flex-1 flex flex-col items-center">
            <ChessBoard fen={game.fen} myColor={myColor} onMove={handleMove} />

            <div className="mt-6 flex justify-center gap-8 w-full max-w-[600px]">
              {/* Player Trắng */}
              <div className="flex flex-col items-center gap-3">
                <ChessClock
                  timeMs={game.whiteTimeRemainingMs}
                  isActive={isGamePlaying && currentTurn === "w"}
                  lastMoveAt={game.lastMoveAt || undefined}
                  color="w"
                />
                <div
                  className={`flex items-center gap-2 ${
                    game.whitePlayerId === user.id
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                  {game.whitePlayerId === user.id ? "Bạn (Trắng)" : "Đối thủ"}
                </div>
              </div>

              {/* Player Đen */}
              <div className="flex flex-col items-center gap-3">
                <ChessClock
                  timeMs={game.blackTimeRemainingMs}
                  isActive={isGamePlaying && currentTurn === "b"}
                  lastMoveAt={game.lastMoveAt || undefined}
                  color="b"
                />
                <div
                  className={`flex items-center gap-2 ${
                    game.blackPlayerId === user.id
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <div className="w-4 h-4 bg-black border border-gray-600 rounded-full"></div>
                  {game.blackPlayerId === user.id
                    ? "Bạn (Đen)"
                    : !game.blackPlayerId
                    ? "Đang chờ..."
                    : "Đối thủ"}
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <MoveHistory history={game.moveHistory} />
            </div>
          </div>

          {/* Right: Chat */}
          <div className="w-full md:w-96 flex-shrink-0">
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user.username}
            />
          </div>
        </div>
      </main>

      {/* Modal Kết thúc */}
      {showModal && (
        <GameOverModal
          winnerId={game.winnerId}
          myId={user.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default GamePage;
