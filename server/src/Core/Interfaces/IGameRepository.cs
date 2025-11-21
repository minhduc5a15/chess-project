using ChessProject.Core.Entities;
using ChessProject.Core.Models;

namespace ChessProject.Core.Interfaces;

public interface IGameRepository
{
    Task AddAsync(Game game);
    Task<Game?> GetByIdAsync(Guid id);
    Task<IEnumerable<Game>> GetWaitingGamesAsync();
    Task<Game?> GetWaitingGameByCreatorIdAsync(string playerId);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Game>> GetGamesByStatusAsync(int page = 1, int pageSize = 10, string? status = "WAITING");
    Task<IEnumerable<Game>> GetGamesByUserAsync(Guid userId, int page, int pageSize);
    Task UpdateAsync(Game game);
    }