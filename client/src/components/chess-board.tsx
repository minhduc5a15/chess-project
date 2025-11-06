import { useState } from "react";
import { Chess, type Square, Move, type Piece } from "chess.js";
import BoardSquare from "./board/board-square";
import ChessPiece from "./board/chess-piece";

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  const board = game.board(); // Lấy trạng thái bàn cờ 8x8 hiện tại

  // --- LOGIC GAME ---

  function makeMove(from: Square, to: Square): boolean {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move({ from, to, promotion: "q" });

      if (result) {
        setGame(gameCopy);
        setLastMove({ from, to });
        return true;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
    return false;
  }

  // Xử lý khi click vào một ô
  function handleSquareClick(square: Square) {
    if (selectedSquare === square) {
      resetSelection();
      return;
    }

    if (selectedSquare) {
      if (makeMove(selectedSquare, square)) {
        resetSelection();
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }) as Move[];
      setValidMoves(moves.map((m) => m.to));
    } else {
      resetSelection();
    }
  }

  // Xử lý khi bắt đầu kéo quân
  function handleDragStart(square: Square) {
    setDraggedSquare(square);
    // Hiển thị các nước đi hợp lệ ngay khi bắt đầu kéo
    const moves = game.moves({ square, verbose: true }) as Move[];
    setValidMoves(moves.map((m) => m.to));
  }

  // Xử lý khi thả quân vào một ô
  function handleDrop(targetSquare: Square) {
    if (draggedSquare) {
      makeMove(draggedSquare, targetSquare);
    }
    resetSelection();
    setDraggedSquare(null);
  }

  function resetSelection() {
    setSelectedSquare(null);
    setValidMoves([]);
  }

  const isKingInCheck = (square: Square, piece: Piece | null) => {
    return piece?.type === "k" && piece.color === game.turn() && game.inCheck();
  };

  // --- RENDER ---

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[600px] p-4">
        <div className="aspect-square w-full border-8 border-gray-800 rounded-sm overflow-hidden shadow-2xl bg-gray-800 grid grid-cols-8">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const file = String.fromCharCode(97 + colIndex); // a, b, c...
              const rank = 8 - rowIndex; // 8, 7, 6...
              const square = `${file}${rank}` as Square;

              return (
                <BoardSquare
                  key={square}
                  square={square}
                  isSelected={selectedSquare === square}
                  isLastMove={
                    lastMove?.from === square || lastMove?.to === square
                  }
                  isCheck={isKingInCheck(square, piece)}
                  isValidMove={validMoves.includes(square)}
                  isCaptureMove={validMoves.includes(square) && !!piece}
                  showCoordinates={{
                    rank: colIndex === 0 ? rank : undefined,
                    file: rowIndex === 7 ? file : undefined,
                  }}
                  onClick={handleSquareClick}
                  onDrop={handleDrop}
                >
                  {piece && (
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      square={square}
                      canDrag={piece.color === game.turn()}
                      onDragStart={handleDragStart}
                    />
                  )}
                </BoardSquare>
              );
            })
          )}
        </div>
      </div>

      {/* Thanh trạng thái */}
      <div className="mt-4 text-white bg-gray-800 px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
        <div className="text-lg">
          Lượt:{" "}
          <strong
            className={game.turn() === "w" ? "text-green-400" : "text-gray-400"}
          >
            {game.turn() === "w" ? "TRẮNG" : "ĐEN"}
          </strong>
        </div>
        {game.inCheck() && !game.isCheckmate() && (
          <div className="px-3 py-1 bg-red-600/80 rounded text-sm font-bold animate-pulse">
            CHIẾU!
          </div>
        )}
        {game.isCheckmate() && (
          <div className="px-3 py-1 bg-red-600 rounded text-sm font-bold">
            CHIẾU BÍ! {game.turn() === "w" ? "Đen" : "Trắng"} thắng
          </div>
        )}
        {game.isDraw() && (
          <div className="px-3 py-1 bg-yellow-600 rounded text-sm font-bold">
            HÒA CỜ
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
