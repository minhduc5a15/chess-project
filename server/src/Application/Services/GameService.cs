using ChessDotNet;
using ChessProject.Application.DTOs;
using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;

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
            WhitePlayerId = playerId,
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

        // Khởi tạo thời điểm bắt đầu tính giờ
        game.LastMoveAt = DateTime.UtcNow;

        await _gameRepository.UpdateAsync(game);
        return true;
    }

    // === REFACTORED MAKE MOVE ===
    public async Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId)
    {
        // 1. Lấy game từ DB
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (!IsValidGameSession(game, playerId)) return false;

        // 2. Khởi tạo bàn cờ logic
        var chessGame = new ChessGame(game!.FEN);

        // 3. Kiểm tra lượt đi hợp lệ
        if (!IsPlayerTurn(chessGame, game, playerId)) return false;

        // 4. Parse và kiểm tra nước đi
        var move = ParseMove(moveUCI, chessGame.WhoseTurn);
        if (!chessGame.IsValidMove(move)) return false;

        // 5. Xử lý thời gian (Đồng hồ)
        if (!UpdateGameTimer(game, chessGame.WhoseTurn))
        {
            // Nếu hết giờ -> Kết thúc game luôn
            await _gameRepository.UpdateAsync(game);
            return true;
        }

        // 6. Thực hiện nước đi trên bàn cờ logic
        chessGame.MakeMove(move, true);

        // 7. Cập nhật trạng thái game (FEN, History, Winner...)
        UpdateGameState(game, chessGame, moveUCI, playerId);

        // 8. Lưu xuống DB
        await _gameRepository.UpdateAsync(game);
        return true;
    }

    // --- HELPER METHODS ---

    private bool IsValidGameSession(Game? game, string playerId)
    {
        if (game == null || game.Status != "PLAYING") return false;
        return game.WhitePlayerId == playerId || game.BlackPlayerId == playerId;
    }

    private bool IsPlayerTurn(ChessGame chessGame, Game game, string playerId)
    {
        if (chessGame.WhoseTurn == Player.White)
            return game.WhitePlayerId == playerId;

        return game.BlackPlayerId == playerId;
    }

    private Move ParseMove(string moveUCI, Player player)
    {
        var source = moveUCI.Substring(0, 2);
        var destination = moveUCI.Substring(2, 2);
        var promotion = moveUCI.Length == 5 ? (char?)moveUCI[4] : null;
        return new Move(source, destination, player, promotion);
    }

    private bool UpdateGameTimer(Game game, Player currentTurn)
    {
        // Nếu chưa có nước đi nào thì chưa trừ giờ (hoặc tùy luật)
        if (!game.LastMoveAt.HasValue)
        {
            game.LastMoveAt = DateTime.UtcNow;
            return true;
        }

        var now = DateTime.UtcNow;
        var elapsedMs = (long)(now - game.LastMoveAt.Value).TotalMilliseconds;

        if (currentTurn == Player.White)
        {
            game.WhiteTimeRemainingMs -= elapsedMs;
            if (game.WhiteTimeRemainingMs <= 0)
            {
                game.WhiteTimeRemainingMs = 0;
                SetGameResult(game, "FINISHED", game.BlackPlayerId); // Trắng hết giờ -> Đen thắng
                return false; // Báo hiệu game kết thúc do hết giờ
            }
        }
        else
        {
            game.BlackTimeRemainingMs -= elapsedMs;
            if (game.BlackTimeRemainingMs <= 0)
            {
                game.BlackTimeRemainingMs = 0;
                SetGameResult(game, "FINISHED", game.WhitePlayerId); // Đen hết giờ -> Trắng thắng
                return false;
            }
        }

        // Cập nhật mốc thời gian mới
        game.LastMoveAt = now;
        return true;
    }

    private void UpdateGameState(Game game, ChessGame chessGame, string moveUCI, string playerId)
    {
        // Cập nhật FEN và Lịch sử
        game.FEN = chessGame.GetFen();
        game.MoveHistory += $"{moveUCI} ";

        // Kiểm tra điều kiện kết thúc game
        if (chessGame.IsCheckmated(chessGame.WhoseTurn))
        {
            SetGameResult(game, "FINISHED", playerId); // Người vừa đi là người thắng
        }
        else if (chessGame.IsStalemated(chessGame.WhoseTurn) || chessGame.IsDraw())
        {
            SetGameResult(game, "FINISHED", null); // Hòa
        }
    }

    private void SetGameResult(Game game, string status, string? winnerId)
    {
        game.Status = status;
        game.WinnerId = winnerId;
        game.FinishedAt = DateTime.UtcNow;
    }

    private static GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            FEN = game.FEN,
            Status = game.Status,
            CreatedAt = game.CreatedAt,
            // Mapping thêm các trường thời gian
            WhiteTimeRemainingMs = game.WhiteTimeRemainingMs,
            BlackTimeRemainingMs = game.BlackTimeRemainingMs,
            LastMoveAt = game.LastMoveAt,
            WinnerId = game.WinnerId,
            MoveHistory = game.MoveHistory
        };
    }

    public async Task<bool> ResignAsync(Guid gameId, string playerId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null || game.Status != "PLAYING") return false;

        string? winnerId = null;
        if (playerId == game.WhitePlayerId)
        {
            winnerId = game.BlackPlayerId; // Trắng đầu hàng -> Đen thắng
        }
        else if (playerId == game.BlackPlayerId)
        {
            winnerId = game.WhitePlayerId; // Đen đầu hàng -> Trắng thắng
        }
        else
        {
            return false; // Người gọi không phải người chơi
        }

        // Cập nhật trạng thái
        game.Status = "FINISHED";
        game.WinnerId = winnerId;
        game.FinishedAt = DateTime.UtcNow;

        game.MoveHistory += " (Resign)";

        await _gameRepository.UpdateAsync(game);
        return true;
    }

    public async Task<bool> DrawAsync(Guid gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null || game.Status != "PLAYING") return false;

        game.Status = "FINISHED";
        game.WinnerId = null; // Null nghĩa là Hòa
        game.FinishedAt = DateTime.UtcNow;

        await _gameRepository.UpdateAsync(game);
        return true;
    }
}