using ChessProject.Application.DTOs;
using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using ChessDotNet;

namespace ChessProject.Application.Services;

public class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;

    public GameService(IGameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<GameDto> CreateGameAsync(string playerId)
    {
        var game = new Game
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = playerId, // Mặc định người tạo cầm quân Trắng
            Status = "WAITING",
            CreatedAt = DateTime.UtcNow
        };

        await _gameRepository.AddAsync(game);

        return MapToDto(game);
    }

    public async Task<IEnumerable<GameDto>> GetWaitingGamesAsync()
    {
        var games = await _gameRepository.GetWaitingGamesAsync();
        return games.Select(MapToDto);
    }

    public async Task<GameDto?> GetGameByIdAsync(Guid gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        return game == null ? null : MapToDto(game);
    }

    public async Task<bool> JoinGameAsync(Guid gameId, string playerId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);

        if (game == null || game.Status != "WAITING" || game.WhitePlayerId == playerId)
        {
            return false;
        }

        game.BlackPlayerId = playerId;
        game.Status = "PLAYING";
        await _gameRepository.UpdateAsync(game);
        return true;
    }

    public async Task UpdateGameFenAsync(Guid gameId, string newFen)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game != null)
        {
            game.FEN = newFen;

            await _gameRepository.UpdateAsync(game);
        }
    }

    // Hàm helper đơn giản để chuyển Entity -> DTO
    private static GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            FEN = game.FEN,
            Status = game.Status,
            CreatedAt = game.CreatedAt
        };
    }

    public async Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null || game.Status != "PLAYING") return false;

        // 1. Xác định người chơi
        bool isWhite = game.WhitePlayerId == playerId;
        bool isBlack = game.BlackPlayerId == playerId;

        if (!isWhite && !isBlack) return false; // Không phải người chơi trong phòng

        // 2. Khởi tạo bàn cờ với FEN hiện tại
        var chessGame = new ChessGame(game.FEN);

        // Kiểm tra lượt đi (Server side check)
        if ((chessGame.WhoseTurn == Player.White && !isWhite) ||
            (chessGame.WhoseTurn == Player.Black && !isBlack))
        {
            return false; // Chưa đến lượt
        }

        // 3. Parse nước đi từ UCI (vd: "e2e4")
        var source = moveUCI.Substring(0, 2);
        var destination = moveUCI.Substring(2, 2);
        var promotion = moveUCI.Length == 5 ? (char?)moveUCI[4] : null;

        var move = new Move(source, destination, chessGame.WhoseTurn, promotion);

        // 4. Kiểm tra tính hợp lệ
        if (!chessGame.IsValidMove(move))
        {
            return false;
        }

        // 5. Thực hiện nước đi
        chessGame.MakeMove(move, true); // true = validate again

        // 6. Cập nhật Entity Game
        game.FEN = chessGame.GetFen();
        game.MoveHistory += $"{moveUCI} "; // Lưu lịch sử

        // Kiểm tra kết thúc game
        if (chessGame.IsCheckmated(chessGame.WhoseTurn))
        {
            game.Status = "FINISHED";
            game.WinnerId = playerId; // Người vừa đi là người thắng
            game.FinishedAt = DateTime.UtcNow;
        }
        else if (chessGame.IsStalemated(chessGame.WhoseTurn) || chessGame.IsDraw())
        {
            game.Status = "FINISHED";
            game.WinnerId = null; // Hòa
            game.FinishedAt = DateTime.UtcNow;
        }

        await _gameRepository.UpdateAsync(game);
        return true;
    }
}