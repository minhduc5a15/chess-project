using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using ChessProject.Core.Models;
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
        return await _context.Games
            .Where(g => g.Status == "WAITING")
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

<<<<<<< HEAD
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
=======
    public async Task<bool> HasActiveGameAsync(string playerId)
    {
        return await _context.Games.AnyAsync(g =>
            (g.WhitePlayerId == playerId || g.BlackPlayerId == playerId) &&
            (g.Status == "WAITING" || g.Status == "PLAYING"));
    }

    public async Task<PaginatedResult<Game>> GetGamesByStatusAsync(string status, int pageIndex, int pageSize)
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
    {
        var query = _context.Games.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(g => g.Status == status);
        }

<<<<<<< HEAD
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
=======
        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<Game>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<Game>> GetGamesByUserIdAsync(string userId, string status, int pageIndex, int pageSize)
    {
        var query = _context.Games.AsQueryable();

        // Lọc theo user tham gia (dù là Trắng hay Đen)
        query = query.Where(g => g.WhitePlayerId == userId || g.BlackPlayerId == userId);

        // Lọc theo status (nếu không phải ALL)
        if (!string.IsNullOrEmpty(status) && status != "ALL")
        {
            query = query.Where(g => g.Status == status);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<Game>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
>>>>>>> 3efbb6bcef957fb04fcd970e30cda3a5f228393d
    }

    public async Task UpdateAsync(Game game)
    {
        _context.Games.Update(game);
        await _context.SaveChangesAsync();
    }

    public async Task<Game?> GetActiveGameByUserIdAsync(string userId)
    {
        return await _context.Games
            .Where(g => (g.WhitePlayerId == userId || g.BlackPlayerId == userId) &&
                        (g.Status == "WAITING" || g.Status == "PLAYING"))
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var game = await _context.Games.FindAsync(id);
        if (game != null)
        {
            _context.Games.Remove(game);
            await _context.SaveChangesAsync();
        }
    }
}