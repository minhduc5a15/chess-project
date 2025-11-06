import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { type Game } from "../types/game";
import { gameApi } from "../api/game-api";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm load danh sách phòng
  const loadGames = async () => {
    try {
      const data = await gameApi.getWaitingGames();
      setGames(data);
    } catch (error) {
      console.error("Failed to load games:", error);
    }
  };

  useEffect(() => {
    loadGames();
    // Có thể thêm setInterval để auto-refresh danh sách phòng mỗi 5s
    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý tạo phòng
  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      const newGame = await gameApi.createGame();
      navigate(`/game/${newGame.id}`);
    } catch (error) {
      alert("Không thể tạo phòng mới");
      console.error("Failed to create game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tham gia phòng
  const handleJoinGame = async (gameId: string) => {
    try {
      await gameApi.joinGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      alert("Không thể tham gia phòng");
      console.error("Failed to join game:", error);
      loadGames(); // Reload lại danh sách để cập nhật
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-xl font-bold flex items-center gap-2">
          Sảnh Cờ Vua <span className="text-2xl">♟️</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
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

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Các phòng đang chờ</h2>
          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Đang tạo..." : "+ Tạo phòng mới"}
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-4">
              Hiện chưa có phòng nào đang chờ.
            </p>
            <p className="text-gray-500">Hãy là người đầu tiên tạo phòng!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-blue-400">
                      Phòng #{game.id.slice(0, 8)}...
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Chủ phòng:{" "}
                      <span className="text-white">
                        {game.whitePlayerId ? "Quân Trắng" : "Quân Đen"}
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-500 text-xs rounded-full">
                    Waiting
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  Tạo lúc: {new Date(game.createdAt).toLocaleString()}
                </div>

                <button
                  onClick={() => handleJoinGame(game.id)}
                  // Không cho phép tự join phòng mình tạo (nếu muốn test 1 mình thì bỏ điều kiện này)
                  disabled={game.whitePlayerId === user?.id}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {game.whitePlayerId === user?.id
                    ? "Phòng của bạn"
                    : "Vào chơi ngay"}
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
