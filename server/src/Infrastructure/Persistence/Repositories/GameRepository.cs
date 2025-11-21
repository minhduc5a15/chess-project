using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ChessProject.Infrastructure.Persistence.Repositories;

public class GameRepository : IGameRepository
{
    private readonly AppDbContext _context;

    public GameRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Game game)
    {
        await _context.Games.AddAsync(game);
        await _context.SaveChangesAsync();
    }

    public async Task<Game?> GetByIdAsync(Guid id)
    {
        return await _context.Games.FindAsync(id);
    }

    public async Task<IEnumerable<Game>> GetWaitingGamesAsync()
    {
        // Lấy các game có trạng thái WAITING, sắp xếp mới nhất lên đầu
        return await _context.Games
            .Where(g => g.Status == "WAITING")
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<Game?> GetWaitingGameByCreatorIdAsync(string playerId)
    {
        return await _context.Games
            .FirstOrDefaultAsync(g => g.Status == "WAITING" && g.WhitePlayerId == playerId);
    }

    public async Task DeleteAsync(Guid id)
    {
        var game = await _context.Games.FindAsync(id);
        if (game == null) return;
        _context.Games.Remove(game);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Game>> GetGamesByStatusAsync(int page = 1, int pageSize = 10, string? status = "WAITING")
    {
        var query = _context.Games.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(g => g.Status == status);
        }

        return await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Game>> GetGamesByUserAsync(Guid userId, int page, int pageSize)
    {
        return await _context.Games
            .Where(g => g.WhitePlayerId == userId.ToString() || g.BlackPlayerId == userId.ToString())
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateAsync(Game game)
    {
        _context.Games.Update(game);
        await _context.SaveChangesAsync();
    }
}