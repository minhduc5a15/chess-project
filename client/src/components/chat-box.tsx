import { useEffect, useRef, useState } from "react";
import { type ChatMessage } from "../types/chat";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: string; 
}

const ChatBox = ({ messages, onSendMessage, currentUser }: ChatBoxProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-[400px] h-96 flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 font-bold border-b border-gray-700 text-gray-300 flex justify-between items-center">
        <span>💬 Trò chuyện</span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
          {messages.length} tin nhắn
        </span>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm italic mt-10">
            Chưa có tin nhắn nào. Hãy nói "Xin chào"! 👋
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.username === currentUser;
          return (
            <div
              key={index}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-xs font-bold ${
                    isMe ? "text-blue-400" : "text-green-400"
                  }`}
                >
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg text-sm max-w-[90%] break-words ${
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-gray-700 text-gray-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-700 bg-gray-800/50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
