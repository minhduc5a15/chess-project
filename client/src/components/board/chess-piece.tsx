import { type Color, type PieceSymbol, type Square } from "chess.js";
import { getPieceImageUrl } from "../../lib/chess-utils";
import clsx from "clsx";

type ChessPieceProps = {
  type: PieceSymbol;
  color: Color;
  square: Square;
  canDrag: boolean;
  onDragStart: (square: Square) => void;
};

const ChessPiece = ({
  type,
  color,
  square,
  canDrag,
  onDragStart,
}: ChessPieceProps) => {
  const imageUrl = getPieceImageUrl(color, type);
  const altText = `${color === "w" ? "White" : "Black"} ${type}`;

  return (
    <img
      src={imageUrl}
      alt={altText}
      draggable={canDrag}
      onDragStart={() => canDrag && onDragStart(square)}
      className={clsx(
        "w-4/5 h-4/5 select-none z-10 transition-transform",
        canDrag
          ? "cursor-grab active:cursor-grabbing active:scale-110"
          : "pointer-events-none"
      )}
    />
  );
};

export default ChessPiece;
