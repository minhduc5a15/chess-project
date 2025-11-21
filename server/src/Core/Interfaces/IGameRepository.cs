using ChessProject.Core.Entities;

namespace ChessProject.Core.Interfaces;

public interface IGameRepository
{
    Task AddAsync(Game game);
    Task<Game?> GetByIdAsync(Guid id);
    Task<IEnumerable<Game>> GetWaitingGamesAsync();
    Task<Game?> GetWaitingGameByCreatorIdAsync(string playerId);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Game>> GetGamesByStatusAsync(string status, int page, int pageSize);
    Task<IEnumerable<Game>> GetGamesByUserAsync(Guid userId, int page, int pageSize);
    Task UpdateAsync(Game game);
}