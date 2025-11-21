using ChessProject.Application.DTOs;

namespace ChessProject.Application.Services;

public interface IGameService
{
    Task<GameDto> CreateGameAsync(string playerId); // playerId là người tạo
    Task<IEnumerable<GameDto>> GetWaitingGamesAsync();

    Task<GameDto?> GetGameByIdAsync(Guid gameId);
    Task<GameDto?> GetWaitingGameByCreatorIdAsync(string playerId);
    Task<bool> DeleteGameAsync(Guid id, string playerId);
    Task<IEnumerable<GameDto>> GetGamesByStatusAsync(int page = 1, int pageSize = 10, string? status = "WAITING");
    Task<IEnumerable<GameDto>> GetGamesByUserAsync(string userId, int page, int pageSize);
    Task<bool> JoinGameAsync(Guid gameId, string playerId);

    Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId);

    Task<bool> ResignAsync(Guid gameId, string playerId);
    Task<bool> DrawAsync(Guid gameId);
}