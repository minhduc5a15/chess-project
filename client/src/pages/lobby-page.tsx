import { useAuthStore } from "../stores/auth-store";
import GameRoomTest from "../components/game-room-test"; // Tái sử dụng component test cũ

const LobbyPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Sảnh Cờ Vua ♟️</h1>
        <div className="flex items-center gap-4">
          <span>
            Xin chào,{" "}
            <strong className="text-blue-400">{user?.username}</strong>
          </span>
          <button
            onClick={() => logout()}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main>
        <GameRoomTest />
      </main>
    </div>
  );
};

export default LobbyPage;
