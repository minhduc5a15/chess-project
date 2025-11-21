using ChessDotNet;
using ChessProject.Application.DTOs;
using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using ChessProject.Core.Models;

namespace ChessProject.Application.Services;

public class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;
    private readonly IUserRepository _userRepository;

    public GameService(IGameRepository gameRepository, IUserRepository userRepository)
    {
        _gameRepository = gameRepository;
        _userRepository = userRepository;
    }

    // Core Methods (Public)
    public async Task<GameDto> CreateGameAsync(string playerId)
    {
        var hasActiveGame = await _gameRepository.HasActiveGameAsync(playerId);
        if (hasActiveGame)
        {
            throw new InvalidOperationException("Bạn đang có ván cờ chưa kết thúc. Hãy hoàn thành hoặc đầu hàng trước khi tạo phòng mới.");
        }

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

    public async Task<PaginatedResult<GameDto>> GetUserGamesAsync(string userId, string status, int page, int pageSize)
    {
        // 1. Lấy Entity
        var pagedGames = await _gameRepository.GetGamesByUserIdAsync(userId, status, page, pageSize);

        // 2. Tái sử dụng logic map username (Có thể tách ra hàm riêng để đỡ lặp code với GetGamesByStatusAsync)
        var playerIds = new List<Guid>();
        foreach (var game in pagedGames.Items)
        {
            if (Guid.TryParse(game.WhitePlayerId, out var wId)) playerIds.Add(wId);
            if (Guid.TryParse(game.BlackPlayerId, out var bId)) playerIds.Add(bId);
        }
        playerIds = playerIds.Distinct().ToList();

        var users = await _userRepository.GetUsersByIdsAsync(playerIds);
        var userDict = users.ToDictionary(u => u.Id.ToString(), u => u.Username);

        var gameDtos = pagedGames.Items.Select(game => new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            WhiteUsername = game.WhitePlayerId != null && userDict.ContainsKey(game.WhitePlayerId) ? userDict[game.WhitePlayerId] : null,
            BlackUsername = game.BlackPlayerId != null && userDict.ContainsKey(game.BlackPlayerId) ? userDict[game.BlackPlayerId] : null,
            FEN = game.FEN,
            Status = game.Status,
            WinnerId = game.WinnerId,
            WhiteTimeRemainingMs = game.WhiteTimeRemainingMs,
            BlackTimeRemainingMs = game.BlackTimeRemainingMs,
            LastMoveAt = game.LastMoveAt,
            MoveHistory = game.MoveHistory,
            CreatedAt = game.CreatedAt
        }).ToList();

        return new PaginatedResult<GameDto>
        {
            Items = gameDtos,
            TotalCount = pagedGames.TotalCount,
            PageIndex = pagedGames.PageIndex,
            PageSize = pagedGames.PageSize
        };
    }

    public async Task<IEnumerable<GameDto>> GetWaitingGamesAsync()
    {
        var games = await _gameRepository.GetWaitingGamesAsync();
        return games.Select(MapToDto);
    }

    public async Task<GameDto?> GetGameByIdAsync(Guid gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null) return null;

        var dto = MapToDto(game);

        // Map Username
        var playerIds = new List<Guid>();
        if (Guid.TryParse(game.WhitePlayerId, out var wId)) playerIds.Add(wId);
        if (Guid.TryParse(game.BlackPlayerId, out var bId)) playerIds.Add(bId);

        if (playerIds.Any())
        {
            var users = await _userRepository.GetUsersByIdsAsync(playerIds);
            var userDict = users.ToDictionary(u => u.Id.ToString(), u => u.Username);

            if (dto.WhitePlayerId != null && userDict.ContainsKey(dto.WhitePlayerId))
                dto.WhiteUsername = userDict[dto.WhitePlayerId];

            if (dto.BlackPlayerId != null && userDict.ContainsKey(dto.BlackPlayerId))
                dto.BlackUsername = userDict[dto.BlackPlayerId];
        }

        return dto;
    }

    public async Task<GameDto?> GetActiveGameAsync(string userId)
    {
        var game = await _gameRepository.GetActiveGameByUserIdAsync(userId);
        if (game == null) return null;

        // Tái sử dụng logic GetGameByIdAsync để lấy full tên
        return await GetGameByIdAsync(game.Id);
    }

    private async Task<PaginatedResult<GameDto>> MapPagedResult(PaginatedResult<Game> pagedGames) {
        var playerIds = new List<Guid>();
        foreach (var g in pagedGames.Items) { if (Guid.TryParse(g.WhitePlayerId, out var w)) playerIds.Add(w); if (Guid.TryParse(g.BlackPlayerId, out var b)) playerIds.Add(b); }
        playerIds = playerIds.Distinct().ToList();
        var users = await _userRepository.GetUsersByIdsAsync(playerIds);
        var userDict = users.ToDictionary(u => u.Id.ToString(), u => u.Username);
        var dtos = pagedGames.Items.Select(g => {
            var d = MapToDto(g);
            if (d.WhitePlayerId != null && userDict.ContainsKey(d.WhitePlayerId)) d.WhiteUsername = userDict[d.WhitePlayerId];
            if (d.BlackPlayerId != null && userDict.ContainsKey(d.BlackPlayerId)) d.BlackUsername = userDict[d.BlackPlayerId];
            return d;
        }).ToList();
        return new PaginatedResult<GameDto> { Items = dtos, TotalCount = pagedGames.TotalCount, PageIndex = pagedGames.PageIndex, PageSize = pagedGames.PageSize };
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

    public async Task<PaginatedResult<GameDto>> GetGamesByStatusAsync(string status, int page, int pageSize)
    {
        // 1. Lấy danh sách Game (Entity) từ Repository
        var pagedGames = await _gameRepository.GetGamesByStatusAsync(status, page, pageSize);

        // 2. Thu thập danh sách ID người chơi cần lấy tên
        var playerIds = new List<Guid>();
        foreach (var game in pagedGames.Items)
        {
            if (Guid.TryParse(game.WhitePlayerId, out var wId)) playerIds.Add(wId);
            if (Guid.TryParse(game.BlackPlayerId, out var bId)) playerIds.Add(bId);
        }

        // Loại bỏ trùng lặp
        playerIds = playerIds.Distinct().ToList();

        // 3. Lấy thông tin User từ Repository
        var users = await _userRepository.GetUsersByIdsAsync(playerIds);
        var userDict = users.ToDictionary(u => u.Id.ToString(), u => u.Username);

        // 4. Map Entity -> DTO và điền Username
        var gameDtos = pagedGames.Items.Select(game => new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            // Map tên từ dictionary
            WhiteUsername = game.WhitePlayerId != null && userDict.ContainsKey(game.WhitePlayerId)
                ? userDict[game.WhitePlayerId]
                : null,
            BlackUsername = game.BlackPlayerId != null && userDict.ContainsKey(game.BlackPlayerId)
                ? userDict[game.BlackPlayerId]
                : null,

            FEN = game.FEN,
            Status = game.Status,
            WinnerId = game.WinnerId,
            WhiteTimeRemainingMs = game.WhiteTimeRemainingMs,
            BlackTimeRemainingMs = game.BlackTimeRemainingMs,
            LastMoveAt = game.LastMoveAt,
            MoveHistory = game.MoveHistory,
            CreatedAt = game.CreatedAt
        }).ToList();

        // 5. Trả về kết quả phân trang dạng DTO
        return new PaginatedResult<GameDto>
        {
            Items = gameDtos,
            TotalCount = pagedGames.TotalCount,
            PageIndex = pagedGames.PageIndex,
            PageSize = pagedGames.PageSize
        };
    }

    // Helper Methods (Private)
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

        if (chessGame.IsCheckmated(chessGame.WhoseTurn))
        {
            SetGameResult(game, "FINISHED", playerId);
        }
        // 2. Kiểm tra Bế tắc (Stalemate) -> Hòa
        else if (chessGame.IsStalemated(chessGame.WhoseTurn))
        {
            SetGameResult(game, "FINISHED", null);
        }
        // 3. Kiểm tra Không đủ quân (Insufficient Material) -> Hòa
        else if (chessGame.IsInsufficientMaterial())
        {
            SetGameResult(game, "FINISHED", null);
        }
        // 4. Kiểm tra luật 50 nước đi (50-move rule)
        // ChessGame đọc HalfMoveClock từ FEN. Nếu >= 100 (50 nước mỗi bên) -> Hòa
        else if (GetHalfMoveClockFromFen(game.FEN) >= 100)
        {
            SetGameResult(game, "FINISHED", null);
        }
    }

    private int GetHalfMoveClockFromFen(string fen)
    {
        var parts = fen.Split(' ');
        if (parts.Length >= 5 && int.TryParse(parts[4], out int halfMove))
        {
            return halfMove;
        }

        return 0;
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
}