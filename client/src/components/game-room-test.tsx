import { useEffect, useState } from "react";
import { useSignalR } from "../hooks/useSignalR";

const GameRoomTest = () => {
  // Lấy thêm isConnected từ hook
  const { connection, isConnected } = useSignalR(
    "https://localhost:7219/hub/chess" // Đảm bảo đúng port 7219 của HTTPS backend
  );
  const [messages, setMessages] = useState<string[]>([]);
  const [gameId, setGameId] = useState("test-room-1");

  useEffect(() => {
    // Chỉ đăng ký sự kiện khi đã có connection object (dù chưa connect xong)
    if (!connection) return;

    // Đăng ký sự kiện (nên làm một lần)
    connection.on("ReceiveMove", (move, playerColor) => {
      const msg = `[${new Date().toLocaleTimeString()}] ${
        playerColor === "w" ? "Trắng" : "Đen"
      } đi: ${move}`;
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup listener khi component unmount hoặc connection thay đổi
    return () => {
      connection.off("ReceiveMove");
    };
  }, [connection]);

  const joinRoom = async () => {
    if (connection && isConnected) {
      try {
        await connection.invoke("JoinGame", gameId);
        setMessages((prev) => [...prev, `--> Đã tham gia phòng: ${gameId}`]);
      } catch (error) {
        console.error("Lỗi JoinGame:", error);
      }
    }
  };

  const sendMove = async (move: string, color: "w" | "b") => {
    if (connection && isConnected) {
      try {
        await connection.invoke("SendMove", gameId, move, color);
      } catch (error) {
        console.error("Lỗi SendMove:", error);
      }
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg max-w-md mx-auto mt-10 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Test SignalR Room
        {/* Hiển thị trạng thái kết nối */}
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
          }`}
        ></span>
      </h2>

      {!isConnected && (
        <div className="text-yellow-500 text-sm mb-4">
          Đang kết nối tới máy chủ...
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          className="border border-gray-600 p-2 rounded flex-1 bg-gray-800 text-white"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          disabled={!isConnected}
        />
        <button
          onClick={joinRoom}
          disabled={!isConnected}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Vào phòng
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => sendMove("e2e4", "w")}
          disabled={!isConnected}
          className="bg-gray-200 hover:bg-white text-black border px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trắng đi (e2e4)
        </button>
        <button
          onClick={() => sendMove("e7e5", "b")}
          disabled={!isConnected}
          className="bg-black hover:bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Đen đi (e7e5)
        </button>
      </div>

      <div className="bg-black p-2 rounded h-40 overflow-auto text-green-400 font-mono text-sm text-left border border-gray-800">
        {messages.length === 0 ? (
          <span className="text-gray-500 italic">Chưa có tin nhắn...</span>
        ) : (
          messages.map((m, i) => <div key={i}>{m}</div>)
        )}
      </div>
    </div>
  );
};

export default GameRoomTest;
