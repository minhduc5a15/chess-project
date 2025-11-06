import { useAuthStore } from "../stores/auth-store";
import ChessBoard from "../components/chess-board";

const LobbyPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header gọn gàng hơn */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-xl font-bold flex items-center gap-2">
          Chess App <span className="text-2xl">♟️</span>
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

      <main className="p-4 md:p-8 container mx-auto flex flex-col items-center">
        <ChessBoard />
      </main>
    </div>
  );
};

export default LobbyPage;
