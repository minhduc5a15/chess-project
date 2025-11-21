import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import ProfileModal from "../components/profile-modal";
<<<<<<< HEAD
import { useSignalR } from "../hooks/useSignalR";
=======
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import Pagination from "../components/ui/pagination";

type GameStatus = "WAITING" | "PLAYING" | "FINISHED";
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
<<<<<<< HEAD
  const [statusFilter, setStatusFilter] = useState<string | null>("WAITING");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [myWaitingGame, setMyWaitingGame] = useState<Game | null>(null);
=======
  const [activeGame, setActiveGame] = useState<Game | null>(null); // [MỚI] State lưu game đang chơi của mình
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
  const [isLoading, setIsLoading] = useState(false);
  const [initialMinutes, setInitialMinutes] = useState<number>(10);
  const [incrementSeconds, setIncrementSeconds] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState(false);
  const [inviteTarget, setInviteTarget] = useState("");

<<<<<<< HEAD
  const { connection, isConnected } = useSignalR(`${window.location.origin}/hub/chess`);

  const loadGames = useCallback(async (pageIndex = page, status = statusFilter) => {
    setIsLoading(true);
    try {
      const data = await gameApi.getGamesByStatus(pageIndex, pageSize, status);
      setGames(data);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const loadMyWaiting = async () => {
    try {
      const g = await gameApi.getMyWaitingGame();
      setMyWaitingGame(g);
    } catch (error) {
      console.error("Lỗi tải phòng chờ của mình:", error);
=======
  const [currentTab, setCurrentTab] = useState<GameStatus>("WAITING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load danh sách phòng + check trạng thái bản thân
  const loadData = async () => {
    try {
      const [gamesData, myActiveGame] = await Promise.all([
        gameApi.getGames(currentTab, page, 9),
        gameApi.getCurrentGame(), // [MỚI] Check xem mình có đang bận không
      ]);

      setGames(gamesData.items);
      setTotalPages(gamesData.totalPages);
      setActiveGame(myActiveGame);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
    }
  };

  const handleTabChange = (val: string) => {
    setCurrentTab(val as GameStatus);
    setPage(1);
    setGames([]);
  };

  useEffect(() => {
<<<<<<< HEAD
    // initial load
    loadGames();
    loadMyWaiting();
    const interval = setInterval(() => {
      loadGames();
      loadMyWaiting();
    }, 5000);
=======
    loadData();
    const interval = setInterval(loadData, 5000);
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
    return () => clearInterval(interval);
  }, [currentTab, page]);

  // Reload when status or page changes
  useEffect(() => {
    loadGames(page, statusFilter);
  }, [loadGames, page, statusFilter]);

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
      if (myWaitingGame) {
        alert("Bạn đã có một phòng chờ. Hủy phòng hiện tại trước khi tạo phòng mới.");
        return;
      }
      const newGame = await gameApi.createGame(initialMinutes, incrementSeconds);
      setShowCreateModal(false);
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

    // [LOGIC MỚI] Nếu mình đang bận (activeGame khác null) và định vào phòng khác -> Chặn
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

<<<<<<< HEAD
  const handleRoomClick = async (game: Game) => {
    if (!user) {
      alert("Bạn cần đăng nhập để vào phòng");
      return;
    }

    // If the user is a participant, just navigate to the game (can move)
    if (user.id === game.whitePlayerId || user.id === game.blackPlayerId) {
      navigate(`/game/${game.id}`);
      return;
    }

    // If waiting, try to join (if slot available)
    if (game.status === "WAITING") {
      if (!game.blackPlayerId) {
        try {
          await gameApi.joinGame(game.id);
          navigate(`/game/${game.id}`);
          return;
        } catch (err) {
          alert("Không thể vào phòng. Có thể người khác đã vào trước.");
          await loadGames();
          return;
        }
      }
      // No slot available, open as viewer
      navigate(`/game/${game.id}`);
      return;
    }

    // If playing or finished, open as viewer
    navigate(`/game/${game.id}`);
  };

  // When using server-side paging we assume `games` is already filtered by status
  const paginatedGames = games;
  // Disable next if returned page is smaller than pageSize
  const canNext = games.length >= pageSize;

  const handleCancelGame = async () => {
    if (!myWaitingGame) return;
    try {
      await gameApi.cancelGame(myWaitingGame.id);
      setMyWaitingGame(null);
      loadGames();
    } catch (error) {
      alert("Không thể hủy phòng");
    }
  };

  // Create modal confirm flow is handled by `handleCreateGame` directly

  const handleInvite = async () => {
    if (!myWaitingGame) {
      alert("Bạn cần tạo phòng chờ trước khi mời");
      return;
    }
    if (!inviteTarget) {
      alert("Nhập username người chơi cần mời");
      return;
    }
    if (!connection || !isConnected) {
      alert("Kết nối realtime chưa sẵn sàng. Vui lòng thử lại sau.");
      return;
    }

    // Prevent inviting self
    if (inviteTarget.trim() === user?.username) {
      alert("Bạn không thể mời chính mình.");
      return;
    }

    try {
      await connection.invoke("InvitePlayer", myWaitingGame.id, inviteTarget.trim());
      // Server will emit InviteSent or InviteFailed
    } catch (err) {
      console.error(err);
      alert("Không thể gửi lời mời");
    }
  };

  // Register SignalR handlers
  useEffect(() => {
    if (!connection || !isConnected || !user) return;

    const handleReceiveInvite = (invite: { gameId: string; inviter: string; gameStatus: string }) => {
      alert(`Bạn nhận được lời mời tham gia phòng ${invite.gameId.substring(0, 4)} từ ${invite.inviter}!`);
      // Reload lists so user can see the room
      loadGames();
      loadMyWaiting();
    };

    const handleInviteSent = (invitedUsername: string) => {
      alert(`Lời mời đã gửi đến ${invitedUsername}`);
      setInviteTarget("");
    };

    const handleInviteFailed = (message: string) => {
      alert(`Lỗi gửi lời mời: ${message}`);
    };

    const handleUpdateBoard = () => {
      // Someone joined or the game state changed; refresh
      loadGames();
      loadMyWaiting();
    };

    connection.on("ReceiveInvite", handleReceiveInvite);
    connection.on("InviteSent", handleInviteSent);
    connection.on("InviteFailed", handleInviteFailed);
    connection.on("UpdateBoard", handleUpdateBoard);

    return () => {
      connection.off("ReceiveInvite", handleReceiveInvite);
      connection.off("InviteSent", handleInviteSent);
      connection.off("InviteFailed", handleInviteFailed);
      connection.off("UpdateBoard", handleUpdateBoard);
    };
  }, [connection, isConnected, user]);
=======
  // ... (renderGameResult giữ nguyên)
  const renderGameResult = (game: Game) => {
    if (game.status !== "FINISHED") return null;
    if (!game.winnerId)
      return <span className="text-yellow-500 font-bold">🤝 Hòa cờ</span>;
    if (game.winnerId === game.whitePlayerId)
      return <span className="text-green-400 font-bold">🏆 Trắng thắng</span>;
    return <span className="text-red-400 font-bold">🏆 Đen thắng</span>;
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

    // [LOGIC MỚI] Nếu mình đang bận ở phòng khác -> Disable nút tham gia
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

>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
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

              {/* Create Game Modal */}
              {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreateModal(false)} />
                  <div className="relative bg-gray-900 p-6 rounded-lg w-96 z-10">
                    <h3 className="text-lg font-bold mb-3">Tùy chỉnh thời gian trận đấu</h3>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-sm text-gray-300">Thời gian (phút)</label>
                        <input type="number" min={1} value={initialMinutes} onChange={e => setInitialMinutes(Math.max(1, parseInt(e.target.value || '1')))} className="w-28 mt-1 p-2 bg-gray-800 rounded" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">Cộng thêm (giây)</label>
                        <input type="number" min={0} value={incrementSeconds} onChange={e => setIncrementSeconds(Math.max(0, parseInt(e.target.value || '0')))} className="w-28 mt-1 p-2 bg-gray-800 rounded" />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-700 rounded">Hủy</button>
                      <button onClick={handleCreateGame} disabled={isLoading || !!myWaitingGame} className="px-4 py-2 bg-green-600 rounded font-bold">{isLoading ? 'Đang tạo...' : 'Tạo'}</button>
                    </div>
                  </div>
                </div>
              )}
            </p>
          </div>
<<<<<<< HEAD
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isLoading || !!myWaitingGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white shadow-lg shadow-green-900/50 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
=======
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
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
                <span className="text-xl">+</span> Tạo phòng mới
              </button>
            </div>
            {myWaitingGame && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-300">ROOM #{myWaitingGame.id.substring(0, 6)}</div>
                <button onClick={handleCancelGame} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded font-bold text-white">Hủy phòng</button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách phòng (Tabs by status + pagination) */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => { setStatusFilter(null); setPage(1); }} className={`px-3 py-1 rounded ${statusFilter === null ? "bg-blue-600" : "bg-gray-800"}`}>All</button>
            <button onClick={() => { setStatusFilter("WAITING"); setPage(1); }} className={`px-3 py-1 rounded ${statusFilter === "WAITING" ? "bg-blue-600" : "bg-gray-800"}`}>Waiting</button>
            <button onClick={() => { setStatusFilter("PLAYING"); setPage(1); }} className={`px-3 py-1 rounded ${statusFilter === "PLAYING" ? "bg-blue-600" : "bg-gray-800"}`}>Playing</button>
            <button onClick={() => { setStatusFilter("FINISHED"); setPage(1); }} className={`px-3 py-1 rounded ${statusFilter === "FINISHED" ? "bg-blue-600" : "bg-gray-800"}`}>Finished</button>
          </div>
          <div className="text-sm text-gray-400">{games.length} rooms (page {page})</div>
        </div>

<<<<<<< HEAD
        {games.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
            <div className="text-6xl mb-4 opacity-20">♟️</div>
            <p className="text-gray-500 text-lg">Chưa có phòng nào.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {paginatedGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleRoomClick(game)}
                  role="button"
                  tabIndex={0}
                  className="group bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-gray-600 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-mono text-xs text-blue-400 mb-1">
                        ROOM #{game.id.substring(0, 4)}
                      </div>
                      <div className="font-bold text-lg text-white">
                        {game.whiteUsername || game.whitePlayerId || "Unknown"} vs {game.blackUsername || (game.blackPlayerId ? game.blackPlayerId : "Waiting")}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded font-bold border border-green-900">
                      {game.status}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleJoinGame(game.id); }}
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

            {/* Pagination controls (server-side) */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50">Prev</button>
              <div className="text-sm text-gray-400">Page {page}</div>
              <button disabled={!canNext} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </main>

      {/* Invite UI */}
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="mb-3 font-bold">Mời người chơi vào phòng của bạn</div>
          <div className="flex gap-2">
            <input value={inviteTarget} onChange={e => setInviteTarget(e.target.value)} placeholder="Nhập username để mời" className="flex-1 p-2 bg-gray-800 rounded" />
            <button onClick={handleInvite} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold">Mời</button>
          </div>
          <div className="text-xs text-gray-500 mt-2">Lưu ý: nhập chính xác username người dùng để mời qua SignalR.</div>
        </div>
      </div>

      {/* Profile Modal */}
=======
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
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default LobbyPage;
