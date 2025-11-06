import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tải danh sách phòng
  const loadGames = async () => {
    try {
      const data = await gameApi.getWaitingGames();
      setGames(data);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng:", error);
    }
  };

  useEffect(() => {
    loadGames();
    // Auto-refresh mỗi 5 giây
    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      const newGame = await gameApi.createGame();
      navigate(`/game/${newGame.id}`);
    } catch (error) {
      alert("Lỗi tạo phòng!");
      console.error("Lỗi tạo phòng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await gameApi.joinGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      alert("Không thể vào phòng");
      console.error("Lỗi vào phòng:", error);
      loadGames();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-xl font-bold">Chess App ♟️</h1>
        <div className="flex items-center gap-4">
          <span>
            Chào, <strong className="text-blue-400">{user?.username}</strong>
          </span>
          <button
            onClick={() => logout()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sảnh chờ</h2>
          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Đang tạo..." : "+ Tạo phòng mới"}
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-500">
              Chưa có phòng nào. Hãy tạo phòng đầu tiên!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex justify-between items-center hover:border-gray-700 transition-colors"
              >
                <div>
                  <div className="font-bold text-lg">
                    Phòng #{game.id.substring(0, 8)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Chủ phòng: {game.whitePlayerId ? "Quân Trắng" : "Quân Đen"}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinGame(game.id)}
                  // Disable nếu chính mình là chủ phòng
                  disabled={game.whitePlayerId === user?.id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {game.whitePlayerId === user?.id
                    ? "Phòng của bạn"
                    : "Vào chơi"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LobbyPage;
