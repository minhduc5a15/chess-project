import { useParams } from "react-router-dom";

const GamePage = () => {
  const { gameId } = useParams();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <h1 className="text-2xl">
        Đang ở phòng game: <span className="text-blue-400">{gameId}</span>
      </h1>
    </div>
  );
};

export default GamePage;
