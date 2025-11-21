"use client";

import type React from "react";

import type { Square } from "chess.js";
import { isDarkSquare } from "../../lib/chess-utils";
import clsx from "clsx";
import type { ReactNode } from "react";

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
        "aspect-square relative flex justify-center items-center transition-colors duration-75",
        // Màu nền cơ bản
        isDark ? "bg-[#769656]" : "bg-[#EEEED2]",
        // Các trạng thái highlight
        isSelected && "after:absolute after:inset-0 after:bg-yellow-400/50",
        isLastMove && "after:absolute after:inset-0 after:bg-yellow-200/40",
        isCheck &&
          "bg-[radial-gradient(circle,rgba(255,0,0,0.8)_0%,transparent_70%)]"
      )}
      onClick={() => onClick(square)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-square={square}
    >
      {/* Hiển thị tọa độ nếu có */}
      {showCoordinates?.rank && (
        <span
          className={clsx(
            "absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold select-none",
            isDark ? "text-[#EEEED2]" : "text-[#769656]"
          )}
        >
          {showCoordinates.rank}
        </span>
      )}
      {showCoordinates?.file && (
        <span
          className={clsx(
            "absolute bottom-0 right-1 text-[10px] sm:text-xs font-bold select-none",
            isDark ? "text-[#EEEED2]" : "text-[#769656]"
          )}
        >
          {showCoordinates.file}
        </span>
      )}

      {/* Hiển thị gợi ý nước đi (dấu chấm hoặc vòng tròn) */}
      {isValidMove && !isCaptureMove && (
        <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-black/15 rounded-full pointer-events-none z-10" />
      )}
      {isCaptureMove && (
        <div className="absolute w-full h-full border-[6px] border-black/15 rounded-full pointer-events-none z-10" />
      )}

      {/* Render quân cờ (nếu có) */}
      {children}
    </div>
  );
};

export default BoardSquare;
