using ChessProject.Core.Entities;

namespace ChessProject.Core.Interfaces;

public interface IGameRepository
{
    Task AddAsync(Game game);
    Task<Game?> GetByIdAsync(Guid id);
    Task<IEnumerable<Game>> GetWaitingGamesAsync();
    Task UpdateAsync(Game game);
}