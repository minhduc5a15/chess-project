using ChessProject.Core.Entities;

namespace ChessProject.Core.Interfaces;

public interface IChatRepository
{
    Task AddAsync(ChatMessage message);
    Task<IEnumerable<ChatMessage>> GetMessagesByGameIdAsync(Guid gameId);
}