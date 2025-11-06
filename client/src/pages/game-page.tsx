import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import { useAuthStore } from "../stores/auth-store";
import type { Game } from "../types/game";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        const data = await gameApi.getGame(gameId);
        setGame(data);
      } catch (error) {
        alert("Không tìm thấy phòng game!");
        navigate("/");
        console.error("Lỗi tải thông tin phòng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Đang tải bàn cờ...
      </div>
    );
  }

  if (!game || !user) return null;

  // Xác định mình là quân gì
  const myColor = user.id === game.whitePlayerId ? "w" : "b";
  const isSpectator =
    user.id !== game.whitePlayerId && user.id !== game.blackPlayerId;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white"
        >
          ← Quay lại sảnh
        </button>
        <div className="font-bold">
          Phòng: {gameId?.substring(0, 8)} | Bạn cầm quân:{" "}
          <span className="text-yellow-400 uppercase">
            {isSpectator ? "Khán giả" : myColor === "w" ? "Trắng" : "Đen"}
          </span>
        </div>
        <div />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {/* CHỖ NÀY SẼ ĐẶT BÀN CỜ ONLINE SAU */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bàn cờ sẽ hiện ở đây</h2>
          <p className="text-gray-400">FEN hiện tại: {game.fen}</p>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
