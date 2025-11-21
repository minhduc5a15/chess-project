using ChessProject.Application.DTOs;

namespace ChessProject.Application.Services;

public interface IGameService
{
    Task<GameDto> CreateGameAsync(string playerId); // playerId là người tạo
    Task<IEnumerable<GameDto>> GetWaitingGamesAsync();

    Task<GameDto?> GetGameByIdAsync(Guid gameId);
    Task<GameDto?> GetWaitingGameByCreatorIdAsync(string playerId);
    Task DeleteGameAsync(Guid id);
    Task<IEnumerable<GameDto>> GetGamesByStatusAsync(string status, int page, int pageSize);
    Task<IEnumerable<GameDto>> GetGamesByUserAsync(string userId, int page, int pageSize);
    Task<bool> JoinGameAsync(Guid gameId, string playerId);

    Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId);

    Task<bool> ResignAsync(Guid gameId, string playerId);
    Task<bool> DrawAsync(Guid gameId);
}