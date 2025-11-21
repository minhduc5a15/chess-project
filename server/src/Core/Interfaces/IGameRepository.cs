using ChessProject.Core.Entities;
using ChessProject.Core.Models;

namespace ChessProject.Core.Interfaces;

public interface IGameRepository
{
    Task AddAsync(Game game);
    Task<Game?> GetByIdAsync(Guid id);
    Task<IEnumerable<Game>> GetWaitingGamesAsync();
    Task<PaginatedResult<Game>> GetGamesByStatusAsync(string status, int pageIndex, int pageSize);

    Task<bool> HasActiveGameAsync(string playerId);

    Task<Game?> GetActiveGameByUserIdAsync(string userId);

    Task<PaginatedResult<Game>> GetGamesByUserIdAsync(string userId, string status, int pageIndex, int pageSize);

    Task UpdateAsync(Game game);
    Task DeleteAsync(Guid id);
}