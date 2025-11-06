import { type Square } from "chess.js";
import { isDarkSquare } from "../../lib/chess-utils";
import clsx from "clsx";
import { type ReactNode } from "react";

type BoardSquareProps = {
  square: Square;
  children?: ReactNode;
  isSelected?: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
  isValidMove?: boolean;
  isCaptureMove?: boolean;
  showCoordinates?: { rank?: number; file?: string };
  onClick: (square: Square) => void;
  onDrop: (square: Square) => void;
};

const BoardSquare = ({
  square,
  children,
  isSelected,
  isLastMove,
  isCheck,
  isValidMove,
  isCaptureMove,
  showCoordinates,
  onClick,
  onDrop,
}: BoardSquareProps) => {
  const isDark = isDarkSquare(square);

  // Xử lý sự kiện kéo thả
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Bắt buộc để cho phép drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(square);
  };

  return (
    <div
      className={clsx(
        "aspect-square relative flex justify-center items-center",
        // Màu nền cơ bản
        isDark ? "bg-[#779556] text-[#ebecd0]" : "bg-[#ebecd0] text-[#779556]",
        // Các trạng thái highlight
        isSelected && "bg-yellow-200/60!",
        isLastMove && "bg-yellow-200/40",
        isCheck && "bg-red-500/90!"
      )}
      onClick={() => onClick(square)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-square={square}
    >
      {/* Hiển thị tọa độ nếu có */}
      {showCoordinates?.rank && (
        <span className="absolute top-0.5 left-0.5 text-[10px] sm:text-xs font-bold select-none">
          {showCoordinates.rank}
        </span>
      )}
      {showCoordinates?.file && (
        <span className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold select-none">
          {showCoordinates.file}
        </span>
      )}

      {/* Hiển thị gợi ý nước đi (dấu chấm hoặc vòng tròn) */}
      {isValidMove && !isCaptureMove && (
        <div className="absolute w-1/3 h-1/3 bg-black/20 rounded-full pointer-events-none" />
      )}
      {isCaptureMove && (
        <div className="absolute w-full h-full border-[6px] border-black/20 rounded-full pointer-events-none" />
      )}

      {/* Render quân cờ (nếu có) */}
      {children}
    </div>
  );
};

export default BoardSquare;
