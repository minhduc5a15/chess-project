import { useEffect, useState } from "react";
import { Chess, type Square, type Piece, Move } from "chess.js";
import BoardSquare from "./board/board-square";
import ChessPiece from "./board/chess-piece";

// 1. Định nghĩa Props để nhận dữ liệu từ cha (GamePage)
interface ChessBoardProps {
  fen: string;
  myColor: "w" | "b" | "spectator";
  onMove: (
    move: { from: string; to: string; promotion?: string },
    newFen: string
  ) => void;
}

const ChessBoard = ({ fen, myColor, onMove }: ChessBoardProps) => {
  // Khởi tạo game từ FEN được truyền vào
  const [game, setGame] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Đồng bộ bàn cờ khi server gửi FEN mới
  useEffect(() => {
    if (!fen) return; // Bỏ qua nếu fen rỗng

    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setSelectedSquare(null);
      setValidMoves([]);
    } catch (e) {
      console.error("Invalid FEN from server:", fen);
    }
  }, [fen]);

  const board = game.board();

  // Chỉ cho phép thao tác nếu đúng lượt và đúng màu quân
  const isMyTurn = game.turn() === myColor;

  // --- LOGIC GAME ---

  function makeMove(from: Square, to: Square): boolean {
    // Chặn nếu không phải lượt mình hoặc là khán giả
    if (!isMyTurn) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const moveResult = gameCopy.move({ from, to, promotion: "q" }); // Tạm thời luôn phong Hậu

      if (moveResult) {
        setGame(gameCopy);
        setLastMove({ from, to });

        // 3. Gửi nước đi lên GamePage (để bắn SignalR)
        onMove({ from, to, promotion: "" }, gameCopy.fen());
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function handleSquareClick(square: Square) {
    if (!isMyTurn && myColor !== "spectator") return;

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
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }) as Move[];
      setValidMoves(moves.map((m) => m.to));
    } else {
      resetSelection();
    }
  }

  function onDragStartHandler(square: Square) {
    if (!isMyTurn) return;
    setDraggedSquare(square);
    const moves = game.moves({ square, verbose: true }) as Move[];
    setValidMoves(moves.map((m) => m.to));
  }

  function onDropHandler(targetSquare: Square) {
    if (draggedSquare) {
      makeMove(draggedSquare, targetSquare);
    }
    setDraggedSquare(null);
    resetSelection();
  }

  function resetSelection() {
    setSelectedSquare(null);
    setValidMoves([]);
  }

  const isKingInCheck = (piece: Piece | null) => {
    return piece?.type === "k" && piece.color === game.turn() && game.inCheck();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Làm mờ bàn cờ nếu không phải lượt mình */}
      <div
        className={`w-full max-w-[600px] p-4 transition-opacity duration-300 ${
          !isMyTurn && myColor !== "spectator" ? "opacity-90" : ""
        }`}
      >
        <div className="aspect-square w-full border-8 border-gray-800 rounded-sm overflow-hidden shadow-2xl bg-gray-800 grid grid-cols-8">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const file = String.fromCharCode(97 + colIndex);
              const rank = 8 - rowIndex;
              const square = `${file}${rank}` as Square;
              const isMyPiece = piece?.color === myColor;

              return (
                <BoardSquare
                  key={square}
                  square={square}
                  isSelected={selectedSquare === square}
                  isLastMove={
                    lastMove?.from === square || lastMove?.to === square
                  }
                  isCheck={isKingInCheck(piece)}
                  isValidMove={validMoves.includes(square)}
                  isCaptureMove={validMoves.includes(square) && !!piece}
                  showCoordinates={{
                    rank: colIndex === 0 ? rank : undefined,
                    file: rowIndex === 7 ? file : undefined,
                  }}
                  onClick={handleSquareClick}
                  onDrop={onDropHandler}
                >
                  {piece && (
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      square={square}
                      canDrag={isMyPiece && isMyTurn}
                      onDragStart={onDragStartHandler}
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
        <div className="text-sm px-3 py-1 bg-blue-900/50 rounded-full border border-blue-700">
          Bạn:{" "}
          <strong className="uppercase text-blue-300">
            {myColor === "spectator"
              ? "Xem"
              : myColor === "w"
              ? "Trắng"
              : "Đen"}
          </strong>
        </div>

        {game.inCheck() && !game.isCheckmate() && (
          <div className="px-3 py-1 bg-red-600/80 rounded text-sm font-bold animate-pulse">
            CHIẾU!
          </div>
        )}
        {game.isCheckmate() && (
          <div className="px-3 py-1 bg-red-600 rounded text-sm font-bold">
            CHIẾU BÍ!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
