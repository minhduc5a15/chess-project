import { useEffect, useState } from "react";
import { Chess, type Square, type Piece, Move } from "chess.js";
import BoardSquare from "./board/board-square";
import ChessPiece from "./board/chess-piece";
import { getPieceImageUrl } from "../lib/chess-utils";

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
  const [promotionMove, setPromotionMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  // Đồng bộ bàn cờ khi server gửi FEN mới
  useEffect(() => {
    if (!fen) return; // Bỏ qua nếu fen rỗng

    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setSelectedSquare(null);
      setValidMoves([]);
      setPromotionMove(null);
    } catch (e) {
      console.error("Invalid FEN from server:", fen);
    }
  }, [fen]);

  let boardToRender = game.board();
  if (myColor === "b") {
    boardToRender = [...boardToRender]
      .reverse()
      .map((row) => [...row].reverse());
  }

  // Chỉ cho phép thao tác nếu đúng lượt và đúng màu quân
  const isMyTurn = myColor !== "spectator" && game.turn() === myColor;

  // --- LOGIC GAME ---

  function makeMove(from: Square, to: Square, promotion?: string): boolean {
    // Chặn nếu không phải lượt mình hoặc là khán giả
    if (!isMyTurn) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const moveOptions = { from, to, promotion: promotion || 'q' };
      const moveResult = gameCopy.move(moveOptions);

      if (moveResult) {
        if (!promotion && moveResult.promotion) {
          setPromotionMove({ from, to });
          return false;
        }
        setGame(gameCopy);
        setLastMove({ from, to });

        // 3. Gửi nước đi lên GamePage (để bắn SignalR)
        onMove({ from, to, promotion }, gameCopy.fen());
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onPromotionSelect(piece: "q" | "r" | "b" | "n") {
    if (promotionMove) {
      makeMove(promotionMove.from, promotionMove.to, piece);
      setPromotionMove(null);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }

  function handleSquareClick(square: Square) {
    // Nếu là spectator hoặc không phải lượt mình thì chặn
    if (myColor === "spectator" || !isMyTurn) return;

    if (promotionMove) return;

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
    if (myColor === "spectator" || !isMyTurn) return;
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
      <div
        className={`w-[600px] p-4 transition-opacity duration-300 ${!isMyTurn && myColor !== "spectator" ? "opacity-90" : ""
          }`}
      >
        <div className="aspect-square w-full border-6 border-gray-800 rounded-sm overflow-hidden shadow-2xl bg-gray-800 grid grid-cols-8">
          {boardToRender.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              // Tính toán lại tọa độ dựa trên việc có xoay bàn cờ hay không

              // Cách an toàn nhất để lấy Square ID là dựa vào vị trí hiển thị
              const rank = myColor === "b" ? rowIndex + 1 : 8 - rowIndex;
              const fileCode = myColor === "b" ? 104 - colIndex : 97 + colIndex; // 104 = 'h', 97 = 'a'
              const file = String.fromCharCode(fileCode);
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
                    // Chỉ hiện tọa độ ở cạnh trái và cạnh dưới
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
                      canDrag={isMyPiece && isMyTurn && !promotionMove}
                      onDragStart={onDragStartHandler}
                    />
                  )}
                </BoardSquare>
              );
            })
          )}
        </div>
      </div>

      {/* Promotion selector (simple) */}
      {promotionMove && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg border-2 border-yellow-500 shadow-2xl">
            <div className="text-white font-bold mb-4 text-center">Chọn quân phong cấp</div>
            <div className="flex gap-4">
              <button
                onClick={() => onPromotionSelect("q")}
                className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition transform hover:scale-110"
                title="Hậu (Queen)"
              >
                <img
                  src={getPieceImageUrl(promotionMove ? (game.turn() === "w" ? "w" : "b") : "w", "q")}
                  alt="Queen"
                  className="w-16 h-16"
                />
              </button>
              <button
                onClick={() => onPromotionSelect("r")}
                className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition transform hover:scale-110"
                title="Xe (Rook)"
              >
                <img
                  src={getPieceImageUrl(promotionMove ? (game.turn() === "w" ? "w" : "b") : "w", "r")}
                  alt="Rook"
                  className="w-16 h-16"
                />
              </button>
              <button
                onClick={() => onPromotionSelect("b")}
                className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition transform hover:scale-110"
                title="Tượng (Bishop)"
              >
                <img
                  src={getPieceImageUrl(promotionMove ? (game.turn() === "w" ? "w" : "b") : "w", "b")}
                  alt="Bishop"
                  className="w-16 h-16"
                />
              </button>
              <button
                onClick={() => onPromotionSelect("n")}
                className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition transform hover:scale-110"
                title="Mã (Knight)"
              >
                <img
                  src={getPieceImageUrl(promotionMove ? (game.turn() === "w" ? "w" : "b") : "w", "n")}
                  alt="Knight"
                  className="w-16 h-16"
                />
              </button>
            </div>
          </div>
        </div>
      )}        {/* Thanh trạng thái */}
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
