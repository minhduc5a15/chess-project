import { type Color, type PieceSymbol, type Square } from "chess.js";

export const getPieceImageUrl = (color: Color, type: PieceSymbol): string => {
  const colorName = color === "w" ? "lt" : "dt";
  const typeName = type === "n" ? "n" : type;
  return `https://upload.wikimedia.org/wikipedia/commons/${getWikiFilename(
    colorName,
    typeName
  )}`;
};

function getWikiFilename(color: string, type: string) {
  const key = `${color}${type}`;
  const map: Record<string, string> = {
    ltp: "4/45/Chess_plt45.svg",
    ltr: "7/72/Chess_rlt45.svg",
    ltn: "7/70/Chess_nlt45.svg",
    ltb: "b/b1/Chess_blt45.svg",
    ltq: "1/15/Chess_qlt45.svg",
    ltk: "4/42/Chess_klt45.svg",
    dtp: "c/c7/Chess_pdt45.svg",
    dtr: "f/ff/Chess_rdt45.svg",
    dtn: "e/ef/Chess_ndt45.svg",
    dtb: "9/98/Chess_bdt45.svg",
    dtq: "4/47/Chess_qdt45.svg",
    dtk: "f/f0/Chess_kdt45.svg",
  };
  return map[key] || "";
}

export const isDarkSquare = (square: Square): boolean => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return (file + rank) % 2 === 0;
};
