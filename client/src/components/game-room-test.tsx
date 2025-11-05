import { useEffect, useState } from "react";
import { useSignalR } from "../hooks/useSignalR";

const GameRoomTest = () => {
  // Kết nối đến Hub server
  const { connection, startConnection } = useSignalR(
    "https://localhost:5179/hub/chess"
  );
  const [messages, setMessages] = useState<string[]>([]);
  const [gameId, setGameId] = useState("test-room-1");

  useEffect(() => {
    if (connection) {
      startConnection();

      // Lắng nghe sự kiện 'ReceiveMove' từ Server
      connection.on("ReceiveMove", (move, playerColor) => {
        const msg = `Nhận nước đi: ${move} từ quân ${
          playerColor === "w" ? "Trắng" : "Đen"
        }`;
        setMessages((prev) => [...prev, msg]);
      });
    }
  }, [connection]);

  const joinRoom = async () => {
    if (connection) await connection.invoke("JoinGame", gameId);
  };

  const sendMoveWhite = async () => {
    if (connection) await connection.invoke("SendMove", gameId, "e2e4", "w");
  };

  const sendMoveBlack = async () => {
    if (connection) await connection.invoke("SendMove", gameId, "e7e5", "b");
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Test SignalR Room</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded flex-1 text-black"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <button
          onClick={joinRoom}
          className="bg-blue-500 px-4 py-2 rounded text-white"
        >
          Vào phòng
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={sendMoveWhite}
          className="bg-white text-black border px-4 py-2 rounded"
        >
          Trắng đi (e2e4)
        </button>
        <button
          onClick={sendMoveBlack}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Đen đi (e7e5)
        </button>
      </div>

      <div className="bg-gray-100 p-2 rounded h-40 overflow-auto text-black text-left">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
};

export default GameRoomTest;
