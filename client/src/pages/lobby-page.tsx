import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import ProfileModal from "../components/profile-modal";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const loadGames = async () => {
    try {
      const data = await gameApi.getWaitingGames();
      setGames(data);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng:", error);
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user])

  useEffect(() => {
    loadGames();
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
      loadGames();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 px-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Chess Online ♟️
        </h1>

        <div className="flex items-center gap-6">
          {/* User Info Clickable */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-gray-500">
              {/* Hiển thị Avatar nếu có */}
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">
                {user?.username}
              </div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          </button>

          {/* Admin Button */}
          {user?.role === "Admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold shadow-lg shadow-purple-900/50 transition cursor-pointer"
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => logout()}
            className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded text-sm font-medium transition cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content (Giữ nguyên logic cũ) */}
      <main className="container mx-auto p-6 max-w-5xl mt-6">
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Sảnh chờ</h2>
            <p className="text-gray-500 mt-1">
              Tham gia hoặc tạo phòng để bắt đầu
            </p>
          </div>
          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white shadow-lg shadow-green-900/50 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isLoading ? (
              "Đang tạo..."
            ) : (
              <>
                <span className="text-xl">+</span> Tạo phòng mới
              </>
            )}
          </button>
        </div>

        {/* Danh sách phòng */}
        {games.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
            <div className="text-6xl mb-4 opacity-20">♟️</div>
            <p className="text-gray-500 text-lg">Chưa có phòng nào được tạo.</p>
            <p className="text-gray-600 text-sm">Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="group bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-gray-600 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-mono text-xs text-blue-400 mb-1">
                      ROOM #{game.id.substring(0, 4)}
                    </div>
                    <div className="font-bold text-lg text-white">
                      {game.whitePlayerId ? "VS Quân Trắng" : "VS Quân Đen"}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded font-bold border border-green-900">
                    WAITING
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={game.whitePlayerId === user?.id}
                  className="w-full py-2.5 bg-gray-800 hover:bg-blue-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-300 hover:text-white"
                >
                  {game.whitePlayerId === user?.id
                    ? "Đang chờ đối thủ..."
                    : "Vào chơi ngay →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default LobbyPage;
