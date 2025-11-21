using ChessProject.Application.DTOs;
using ChessProject.Core.Models;

namespace ChessProject.Application.Services;

public interface IGameService
{
    Task<GameDto> CreateGameAsync(string playerId, CreateGameDto dto);
    
    Task<IEnumerable<GameDto>> GetWaitingGamesAsync();
    Task<GameDto?> GetGameByIdAsync(Guid gameId);
    Task<bool> JoinGameAsync(Guid gameId, string playerId);
    Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId);
    Task<bool> ResignAsync(Guid gameId, string playerId);
    Task<bool> DrawAsync(Guid gameId);

    Task<PaginatedResult<GameDto>> GetGamesByStatusAsync(string status, int page, int pageSize);
    Task<PaginatedResult<GameDto>> GetUserGamesAsync(string userId, string status, int page, int pageSize);
    Task<GameDto?> GetActiveGameAsync(string userId);
    Task<bool> CancelGameAsync(Guid gameId, string userId);
}