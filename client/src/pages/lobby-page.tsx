import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import ProfileModal from "../components/profile-modal";
import { useSignalR } from "../hooks/useSignalR";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>("WAITING");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [myWaitingGame, setMyWaitingGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMinutes, setInitialMinutes] = useState<number>(10);
  const [incrementSeconds, setIncrementSeconds] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState(false);
  const [inviteTarget, setInviteTarget] = useState("");

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
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user])

  useEffect(() => {
    // initial load
    loadGames();
    loadMyWaiting();
    const interval = setInterval(() => {
      loadGames();
      loadMyWaiting();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reload when status or page changes
  useEffect(() => {
    loadGames(page, statusFilter);
  }, [loadGames, page, statusFilter]);

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      if (myWaitingGame) {
        alert("Bạn đã có một phòng chờ. Hủy phòng hiện tại trước khi tạo phòng mới.");
        return;
      }
      const newGame = await gameApi.createGame(initialMinutes, incrementSeconds);
      setShowCreateModal(false);
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
            onClick={() => user && navigate(`/user/${user.username}`)}
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isLoading || !!myWaitingGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white shadow-lg shadow-green-900/50 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
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
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default LobbyPage;
