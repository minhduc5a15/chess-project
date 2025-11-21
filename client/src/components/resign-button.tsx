import { useState } from "react";

interface ResignButtonProps {
  onResign: () => void;
  disabled?: boolean;
}

const ResignButton = ({ onResign, disabled = false }: ResignButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmResign = () => {
    onResign();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 shadow-xl max-w-sm">
          <h2 className="text-xl font-bold text-white mb-4">
            ⚠️ Xác nhận đầu hàng?
          </h2>
          <p className="text-gray-300 mb-6">
            Nếu bạn đầu hàng, bạn sẽ thua trận này. Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmResign}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition"
            >
              Đầu hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={disabled}
      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold transition flex items-center gap-2"
    >
      🏳️ Đầu hàng
    </button>
  );
};

export default ResignButton;
