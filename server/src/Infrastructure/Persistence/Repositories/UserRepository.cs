using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using ChessProject.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ChessProject.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync(); // save changes after adding
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        // Sắp xếp user mới nhất lên đầu
        return await _context.Users.OrderByDescending(u => u.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersByIdsAsync(IEnumerable<Guid> ids)
    {
        return await _context.Users
            .Where(u => ids.Contains(u.Id))
            .ToListAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}