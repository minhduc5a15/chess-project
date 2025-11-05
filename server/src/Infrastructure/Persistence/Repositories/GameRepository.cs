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

    public async Task UpdateAsync(Game game)
    {
        _context.Games.Update(game);
        await _context.SaveChangesAsync();
    }
}