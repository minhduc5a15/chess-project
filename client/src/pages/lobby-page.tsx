import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import ProfileModal from "../components/profile-modal";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import Pagination from "../components/ui/pagination";

type GameStatus = "WAITING" | "PLAYING" | "FINISHED";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null); // [MỚI] State lưu game đang chơi của mình
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [currentTab, setCurrentTab] = useState<GameStatus>("WAITING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load danh sách phòng + check trạng thái bản thân
  const loadData = useCallback(async () => {
    try {
      const [gamesData, myActiveGame] = await Promise.all([
        gameApi.getGames(currentTab, page, 9),
        gameApi.getCurrentGame(), // Check xem mình có đang bận không
      ]);

      setGames(gamesData.items);
      setTotalPages(gamesData.totalPages);
      setActiveGame(myActiveGame);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }, [currentTab, page]);

  const handleTabChange = (val: string) => {
    setCurrentTab(val as GameStatus);
    setPage(1);
    setGames([]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCreateGame = async () => {
    // [LOGIC MỚI] Chặn ở client
    if (activeGame) {
      alert(
        `Bạn đang có phòng chưa kết thúc (${activeGame.id.substring(
          0,
          4
        )}). Hãy hoàn thành nó trước!`
      );
      return;
    }

    setIsLoading(true);
    try {
      const newGame = await gameApi.createGame();
      navigate(`/game/${newGame.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi tạo phòng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterRoom = async (game: Game) => {
    if (game.status === "FINISHED") {
      navigate(`/game/${game.id}`);
      return;
    }

    // Nếu là người trong cuộc -> Vào lại
    if (game.whitePlayerId === user?.id || game.blackPlayerId === user?.id) {
      navigate(`/game/${game.id}`);
      return;
    }

    // Nếu mình đang bận (activeGame khác null) và định vào phòng khác -> Chặn
    if (activeGame) {
      alert(
        "Bạn đang trong một ván đấu khác. Không thể tham gia thêm phòng mới."
      );
      return;
    }

    if (game.status === "PLAYING") {
      alert("Phòng đang diễn ra.");
      return;
    }

    try {
      await gameApi.joinGame(game.id);
      navigate(`/game/${game.id}`);
    } catch (error) {
      alert("Không thể vào phòng.");
      loadData();
    }
  };

  const renderGameResult = (game: Game) => {
    if (game.status !== "FINISHED") return null;
    if (!game.winnerId)
      return <span className="text-yellow-500 font-bold">🤝 Hòa cờ</span>;
    if (game.winnerId === game.whitePlayerId)
      return <span className="text-green-400 font-bold">🏆 Trắng thắng</span>;
    return <span className="text-red-400 font-bold">🏆 Đen thắng</span>;
  };

  const handleCancelActiveGame = async () => {
    if (!activeGame) return;
    if (!window.confirm("Bạn chắc chắn muốn hủy phòng này?")) return;

    try {
      await gameApi.cancelGame(activeGame.id);
      setActiveGame(null); // Xóa trạng thái bận
      loadData(); // Tải lại danh sách
      alert("Đã hủy phòng thành công!");
    } catch (error) {
      alert(
        "Không thể hủy phòng (có thể ván đấu đã bắt đầu). Hãy vào phòng để kiểm tra."
      );
    }
  };

  const getButtonConfig = (game: Game) => {
    const isParticipant =
      game.whitePlayerId === user?.id || game.blackPlayerId === user?.id;

    if (game.status === "FINISHED") {
      return {
        text: "Xem kết quả 👁️",
        disabled: false,
        style: "bg-gray-700 hover:bg-gray-600 text-gray-200",
      };
    }

    if (isParticipant) {
      return {
        text: "Vào lại phòng ↩️",
        disabled: false,
        style: "bg-blue-600 hover:bg-blue-500 text-white animate-pulse",
      };
    }

    // Nếu mình đang bận ở phòng khác -> Disable nút tham gia
    if (activeGame) {
      return {
        text: "Bạn đang bận 🚫",
        disabled: true,
        style: "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50",
      };
    }

    if (game.status === "PLAYING") {
      return {
        text: "Đang diễn ra 🚫",
        disabled: true,
        style: "bg-slate-800 text-slate-500 cursor-not-allowed",
      };
    }

    return {
      text: "Tham gia ngay ⚔️",
      disabled: false,
      style:
        "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20",
    };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur px-8 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Chess Online ♟️
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/my-games")}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm font-medium transition cursor-pointer hidden sm:block"
          >
            Lịch sử đấu
          </button>
          <button
            onClick={() => user && navigate(`/user/${user.username}`)}
            className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-gray-500">
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
            <div className="text-left hidden sm:block">
              <div className="text-sm font-bold text-white">
                {user?.username}
              </div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          </button>
          {user?.role === "Admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold shadow-lg transition cursor-pointer"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => logout()}
            className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded text-sm font-medium transition cursor-pointer"
          >
            Thoát
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 max-w-6xl mt-4">
        {/* Alert nếu đang có active game */}
        {activeGame && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-lg mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
            <span>
              ⚠️ Bạn đang có một ván đấu chưa kết thúc (Phòng #
              {activeGame.id.substring(0, 4)}).
            </span>
            {activeGame.status === "WAITING" &&
              activeGame.whitePlayerId === user?.id && (
                <button
                  onClick={handleCancelActiveGame}
                  className="px-4 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded font-bold text-sm transition-colors"
                >
                  Hủy phòng
                </button>
              )}
            <button
              onClick={() => navigate(`/game/${activeGame.id}`)}
              className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold text-sm transition-colors"
            >
              Quay lại ngay
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Sảnh chờ</h2>
            <p className="text-gray-500 mt-1">
              Tham gia hoặc tạo phòng để bắt đầu
            </p>
          </div>
          <button
            onClick={handleCreateGame}
            disabled={isLoading || !!activeGame} // [MỚI] Disable nếu đang có activeGame
            className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-bold text-white shadow-lg shadow-green-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Đang xử lý..."
            ) : activeGame ? (
              "Đang bận"
            ) : (
              <>
                <span className="text-xl">+</span> Tạo phòng mới
              </>
            )}
          </button>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-gray-900 border border-gray-800 mb-6 w-full sm:w-auto inline-flex">
            <TabsTrigger
              value="WAITING"
              className="flex-1 sm:flex-none px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 transition-all"
            >
              Đang chờ
            </TabsTrigger>
            <TabsTrigger
              value="PLAYING"
              className="flex-1 sm:flex-none px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400 transition-all"
            >
              Đang chơi
            </TabsTrigger>
            <TabsTrigger
              value="FINISHED"
              className="flex-1 sm:flex-none px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-gray-400 transition-all"
            >
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="mt-0 min-h-[300px]">
            {games.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                <div className="text-6xl mb-4 opacity-20">♟️</div>
                <p className="text-gray-500 text-lg">
                  Không tìm thấy phòng nào.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => {
                  const btnConfig = getButtonConfig(game);
                  return (
                    <div
                      key={game.id}
                      className="group bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-gray-600 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
                    >
                      <div
                        className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${
                          currentTab === "PLAYING"
                            ? "bg-blue-500"
                            : currentTab === "FINISHED"
                            ? "bg-gray-600"
                            : "bg-green-500"
                        }`}
                      ></div>

                      <div className="mb-4 pl-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-mono text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
                            #{game.id.substring(0, 8)}
                          </div>
                          {currentTab === "FINISHED" && (
                            <div className="text-xs">
                              {renderGameResult(game)}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400"></div>
                              <span
                                className={
                                  game.whiteUsername
                                    ? "text-white font-medium"
                                    : "text-gray-500 italic"
                                }
                              >
                                {game.whiteUsername || "Trống"}
                              </span>
                            </div>
                            {currentTab !== "FINISHED" &&
                              !game.whiteUsername && (
                                <span className="text-[10px] text-green-500">
                                  Còn trống
                                </span>
                              )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-black border border-gray-600"></div>
                              <span
                                className={
                                  game.blackUsername
                                    ? "text-white font-medium"
                                    : "text-gray-500 italic"
                                }
                              >
                                {game.blackUsername || "Trống"}
                              </span>
                            </div>
                            {currentTab !== "FINISHED" &&
                              !game.blackUsername && (
                                <span className="text-[10px] text-green-500">
                                  Còn trống
                                </span>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pl-2 pt-2 border-t border-gray-800/50">
                        <button
                          onClick={() => handleEnterRoom(game)}
                          disabled={btnConfig.disabled}
                          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${btnConfig.style}`}
                        >
                          {btnConfig.text}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </TabsContent>
        </Tabs>
      </main>
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default LobbyPage;
