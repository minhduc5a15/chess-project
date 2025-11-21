using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;
using ChessProject.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ChessProject.Infrastructure.Persistence.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _context;

    public ChatRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ChatMessage message)
    {
        await _context.ChatMessages.AddAsync(message);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ChatMessage>> GetMessagesByGameIdAsync(Guid gameId)
    {
        return await _context.ChatMessages
            .Where(m => m.GameId == gameId)
            .OrderBy(m => m.CreatedAt) // Tin nhắn cũ nhất lên đầu
            .ToListAsync();
    }
}