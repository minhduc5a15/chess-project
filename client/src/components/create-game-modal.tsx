import { useState } from "react";

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: {
    timeLimitMinutes: number;
    incrementSeconds: number;
    side: "white" | "black" | "random";
  }) => void;
  isLoading: boolean;
}

const CreateGameModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateGameModalProps) => {
  const [timeLimit, setTimeLimit] = useState(10);
  const [increment, setIncrement] = useState(0);
  const [side, setSide] = useState<"white" | "black" | "random">("random");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      timeLimitMinutes: Number(timeLimit),
      incrementSeconds: Number(increment),
      side,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
          Tạo phòng mới
        </h2>

        {/* Chọn thời gian */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400">
            Thời gian (phút)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => setTimeLimit(m)}
                className={`py-2 rounded border text-sm font-bold transition ${
                  timeLimit === m
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {m}'
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="180"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none mt-2"
            placeholder="Tùy chỉnh (phút)..."
          />
        </div>

        {/* Chọn Increment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Cộng giờ mỗi nước (giây)
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={increment}
              onChange={(e) => setIncrement(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-white font-mono w-8 text-right">
              {increment}s
            </span>
          </div>
        </div>

        {/* Chọn Phe */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Chọn quân
          </label>
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setSide("white")}
              className={`flex-1 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition ${
                side === "white"
                  ? "bg-white text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
              Trắng
            </button>
            <button
              onClick={() => setSide("random")}
              className={`flex-1 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition ${
                side === "random"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-lg leading-none">?</span>
              Ngẫu nhiên
            </button>
            <button
              onClick={() => setSide("black")}
              className={`flex-1 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition ${
                side === "black"
                  ? "bg-black text-white border border-gray-600 shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-3 h-3 bg-black border border-gray-600 rounded-full"></div>
              Đen
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white shadow-lg shadow-green-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang tạo..." : "Tạo phòng 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGameModal;
