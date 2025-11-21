using ChessProject.Core.Entities;

namespace ChessProject.Core.Interfaces;

public interface IUserRepository
{
    Task<User> GetByUsernameAsync(string username);
    Task AddAsync(User user);
    Task<User?> GetByIdAsync(Guid id);

    Task<IEnumerable<User>> GetAllAsync();
    Task UpdateAsync(User user);
    Task DeleteAsync(Guid id);
}