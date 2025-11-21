"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameApi } from "../api/game-api";
import type { Game } from "../types/game";
import type { User } from "../types/user";
import { useAuthStore } from "../stores/auth-store";
import { useSignalR } from "../hooks/useSignalR";
import ChessBoard from "../components/chess-board";
import { Chess } from "chess.js";
import GameOverModal from "../components/game-over-modal";
import MoveHistory from "../components/move-history";
import type { ChatMessage } from "../types/chat";
import ChatBox from "../components/chat-box";
import ResignButton from "../components/resign-button";
import OfferDrawButton from "../components/offer-draw-button";
import PlayerCard from "../components/player-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface GamePageProps {
  mockGame?: Game;
  mockUser?: User;
}

const GamePage = ({ mockGame, mockUser }: GamePageProps = {}) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  const user = mockUser || authUser;

  const [game, setGame] = useState<Game | null>(mockGame || null);
  const [isLoading, setIsLoading] = useState(!mockGame);
  const [showModal, setShowModal] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { connection, isConnected } = useSignalR(
    "https://localhost:7219/hub/chess"
  );
  const hasJoinedRoom = useRef(false);

  const fetchGameData = useCallback(async () => {
    if (mockGame) return;
    if (!gameId) return;
    try {
      const data = await gameApi.getGame(gameId);
      setGame(data);
      if (data.status === "FINISHED") {
        console.log("Game Finished. Winner:", data.winnerId);
      }
    } catch (error) {
      console.error("Lỗi tải game:", error);
    }
  }, [gameId, mockGame]);

  useEffect(() => {
    if (mockGame) {
      setIsLoading(false);
      return;
    }
    if (!gameId) return;
    const initData = async () => {
      try {
        const [gameData, chatData] = await Promise.all([
          gameApi.getGame(gameId),
          gameApi.getMessages(gameId),
        ]);
        setGame(gameData);
        setMessages(chatData);
      } catch {
        alert("Lỗi tải dữ liệu phòng!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [gameId, navigate, mockGame]);

  useEffect(() => {
    if (mockGame) return;
    if (!gameId) return;
    const initGame = async () => {
      try {
        const data = await gameApi.getGame(gameId);
        setGame(data);
      } catch {
        alert("Không tìm thấy phòng!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    initGame();
  }, [gameId, navigate, mockGame]);

  useEffect(() => {
    if (game?.status === "WAITING") {
      const interval = setInterval(fetchGameData, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchGameData, game?.status]);

  useEffect(() => {
    if (connection && isConnected && gameId) {
      if (!hasJoinedRoom.current) {
        connection
          .invoke("JoinGame", gameId)
          .then(() => {
            console.log("Đã vào phòng SignalR");
            hasJoinedRoom.current = true;
          })
          .catch(console.error);
      }

      const handleUpdateBoard = () => {
        console.log("Nhận nước đi mới. Đang đồng bộ...");
        fetchGameData();
      };

      const handleReceiveMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      };

      const handleDrawOffered = (senderId: string) => {
        if (senderId !== user?.id) {
          const agree = window.confirm("Đối thủ cầu hòa. Bạn có đồng ý không?");
          connection.invoke("RespondDraw", gameId, agree);
        }
      };

      const handleGameOver = () => {
        fetchGameData();
        setTimeout(() => setShowModal(true), 500);
      };

      connection.on("UpdateBoard", handleUpdateBoard);
      connection.on("ReceiveMessage", handleReceiveMessage);
      connection.on("DrawOffered", handleDrawOffered);
      connection.on("GameOver", handleGameOver);
      return () => {
        connection.off("UpdateBoard", handleUpdateBoard);
        connection.off("ReceiveMessage", handleReceiveMessage);
        connection.off("DrawOffered", handleDrawOffered);
        connection.off("GameOver", handleGameOver);
      };
    }
  }, [connection, isConnected, gameId, fetchGameData, user]);

  useEffect(() => {
    if (game?.status === "FINISHED") {
      setTimeout(() => setShowModal(true), 500);
    }
  }, [game?.status]);

  const handleMove = async (
    move: { from: string; to: string; promotion?: string },
    newFen: string
  ) => {
    if (!connection || !isConnected || !gameId) return;

    setGame((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fen: newFen,
        lastMoveAt: new Date().toISOString(),
      };
    });

    const moveUCI = `${move.from}${move.to}${move.promotion || ""}`;
    try {
      await connection.invoke("SendMove", gameId, moveUCI, newFen);
    } catch (error) {
      console.error("Lỗi gửi:", error);
      fetchGameData();
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!connection || !isConnected || !gameId || !user) return;
    try {
      await connection.invoke("SendMessage", gameId, content);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const handleResign = async () => {
    if (!window.confirm("Bạn chắc chắn muốn đầu hàng?")) return;
    if (connection && isConnected && gameId) {
      await connection.invoke("Resign", gameId);
    }
  };

  const handleOfferDraw = async () => {
    if (connection && isConnected && gameId) {
      await connection.invoke("OfferDraw", gameId);
      alert("Đã gửi lời mời cầu hòa!");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Loading game...</p>
        </div>
      </div>
    );
  if (!game || !user) return null;

  const myColor =
    user.id === game.whitePlayerId
      ? "w"
      : user.id === game.blackPlayerId
      ? "b"
      : "spectator";
  const chess = new Chess(game.fen);
  const currentTurn = chess.turn();
  const isCheck = chess.inCheck();
  const isCheckmate = chess.isCheckmate();
  const isGamePlaying = game.status === "PLAYING";

  const isBoardFlipped = myColor === "b";

  const whitePlayer = {
    id: game.whitePlayerId,
    username: game.whiteUsername || "Unknown (White)",
    timeMs: game.whiteTimeRemainingMs,
    isActive: isGamePlaying && currentTurn === "w",
    color: "w" as const,
    isCurrentUser: game.whitePlayerId === user.id,
  };

  const blackPlayer = {
    id: game.blackPlayerId,
    username: game.blackPlayerId
      ? game.blackUsername || "Unknown"
      : "Waiting...", 
    timeMs: game.blackTimeRemainingMs,
    isActive: isGamePlaying && currentTurn === "b",
    color: "b" as const,
    isCurrentUser: game.blackPlayerId === user.id,
  };

  const topPlayer = isBoardFlipped ? whitePlayer : blackPlayer;
  const bottomPlayer = isBoardFlipped ? blackPlayer : whitePlayer;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Back to Lobby"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-white">Chess Match</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Room:{" "}
                <span className="font-mono text-blue-400">
                  {gameId?.substring(0, 8)}
                </span>
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-red-500"
                  }`}
                ></div>
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>
        </div>

        {isGamePlaying && myColor !== "spectator" && (
          <div className="hidden md:flex items-center gap-3">
            <OfferDrawButton
              onOfferDraw={handleOfferDraw}
              disabled={!isGamePlaying}
            />
            <ResignButton onResign={handleResign} disabled={!isGamePlaying} />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 lg:p-8 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-6 lg:gap-12 items-start justify-center">
          <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4">Game Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Turn</span>
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-sm ${
                      currentTurn === "w"
                        ? "bg-slate-100 text-slate-900"
                        : "bg-slate-800 text-white border border-slate-600"
                    }`}
                  >
                    {currentTurn === "w" ? "White" : "Black"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status</span>
                  <span className="text-blue-400 font-medium">
                    {game.status}
                  </span>
                </div>
                {isCheck && !isCheckmate && (
                  <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-center font-bold border border-red-500/20 animate-pulse">
                    Check!
                  </div>
                )}
              </div>
            </div>

            {isGamePlaying && myColor !== "spectator" && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white mb-2">Actions</h3>
                <OfferDrawButton
                  onOfferDraw={handleOfferDraw}
                  disabled={!isGamePlaying}
                />
                <ResignButton
                  onResign={handleResign}
                  disabled={!isGamePlaying}
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-[80vh]">
            <div className="w-full">
              <PlayerCard
                username={topPlayer.username}
                color={topPlayer.color}
                timeMs={topPlayer.timeMs}
                isActive={topPlayer.isActive}
                lastMoveAt={game.lastMoveAt || undefined}
                isCurrentUser={topPlayer.isCurrentUser}
              />
            </div>

            <div className="w-full relative z-10">
              <ChessBoard
                fen={game.fen}
                myColor={myColor}
                onMove={handleMove}
              />
            </div>

            <div className="w-full">
              <PlayerCard
                username={bottomPlayer.username}
                color={bottomPlayer.color}
                timeMs={bottomPlayer.timeMs}
                isActive={bottomPlayer.isActive}
                lastMoveAt={game.lastMoveAt || undefined}
                isCurrentUser={bottomPlayer.isCurrentUser}
              />
            </div>

            {isGamePlaying && myColor !== "spectator" && (
              <div className="lg:hidden flex w-full gap-3 mt-2">
                <OfferDrawButton
                  onOfferDraw={handleOfferDraw}
                  disabled={!isGamePlaying}
                />
                <ResignButton
                  onResign={handleResign}
                  disabled={!isGamePlaying}
                />
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 shrink-0 h-[600px] lg:h-[calc(100vh-8rem)] flex flex-col">
            <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900 p-1 rounded-xl mb-4">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 rounded-lg transition-all"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 rounded-lg transition-all"
                >
                  Moves
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 mt-0 h-0 min-h-0">
                <ChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={user.username}
                />
              </TabsContent>

              <TabsContent value="history" className="flex-1 mt-0 h-0 min-h-0">
                <MoveHistory history={game.moveHistory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {showModal && (
        <GameOverModal
          winnerId={game.winnerId}
          myId={user.id}
          whitePlayer={{
            id: game.whitePlayerId,
            username: game.whiteUsername || "Unknown",
          }}
          blackPlayer={{
            id: game.blackPlayerId,
            username: game.blackUsername || "Unknown",
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default GamePage;
