import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import Pagination from "../components/ui/pagination";
import { useAuthStore } from "../stores/auth-store";

type MyGameStatus = "ALL" | "WAITING" | "PLAYING" | "FINISHED";

const MyGamesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [games, setGames] = useState<Game[]>([]);
  const [currentTab, setCurrentTab] = useState<MyGameStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await gameApi.getMyGames(currentTab, page, 9);
        setGames(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
      }
    };
    loadGames();
  }, [currentTab, page]);

  const handleTabChange = (val: string) => {
    setCurrentTab(val as MyGameStatus);
    setPage(1);
    setGames([]);
  };

  // Helper render kết quả
  const renderGameResult = (game: Game) => {
    if (game.status !== "FINISHED") {
      return (
        <span
          className={`text-xs font-bold px-2 py-1 rounded border ${
            game.status === "PLAYING"
              ? "text-blue-400 border-blue-900 bg-blue-900/20"
              : "text-green-400 border-green-900 bg-green-900/20"
          }`}
        >
          {game.status}
        </span>
      );
    }
    if (!game.winnerId)
      return <span className="text-yellow-500 font-bold text-xs">Hòa</span>;
    const isWin = game.winnerId === user?.id;
    return isWin ? (
      <span className="text-green-400 font-bold text-xs">Thắng</span>
    ) : (
      <span className="text-red-400 font-bold text-xs">Thua</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lịch sử đấu của tôi</h1>
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white"
        >
          ← Về Sảnh chờ
        </button>
      </header>

      <div className="max-w-6xl mx-auto">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-gray-900 border border-gray-800 mb-6">
            <TabsTrigger
              value="ALL"
              className="px-6 data-[state=active]:bg-gray-800 transition-all"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value="WAITING"
              className="px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 transition-all"
            >
              Đang chờ
            </TabsTrigger>
            <TabsTrigger
              value="PLAYING"
              className="px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400 transition-all"
            >
              Đang chơi
            </TabsTrigger>
            <TabsTrigger
              value="FINISHED"
              className="px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-gray-400 transition-all"
            >
              Đã xong
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            {games.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-gray-500">Chưa có ván đấu nào.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-gray-900 border border-gray-800 p-4 rounded-xl hover:border-gray-600 transition-all relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono text-gray-500">
                        #{game.id.substring(0, 6)}
                      </span>
                      {renderGameResult(game)}
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <span
                          className={
                            game.whitePlayerId === user?.id
                              ? "text-green-400 font-bold"
                              : "text-gray-300"
                          }
                        >
                          {game.whiteUsername || "Unknown"}{" "}
                          {game.whitePlayerId === user?.id && "(Bạn)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-black border border-gray-600"></div>
                        <span
                          className={
                            game.blackPlayerId === user?.id
                              ? "text-green-400 font-bold"
                              : "text-gray-300"
                          }
                        >
                          {game.blackUsername || "Unknown"}{" "}
                          {game.blackPlayerId === user?.id && "(Bạn)"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/game/${game.id}`)}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                    >
                      {game.status === "FINISHED" ? "Xem lại" : "Vào phòng"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyGamesPage;
