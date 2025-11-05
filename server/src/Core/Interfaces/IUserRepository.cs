using ChessProject.Core.Entities;

namespace ChessProject.Core.Interfaces;

public interface IUserRepository
{
    Task<User> GetByUsernameAsync(string username);
    Task AddAsync(User user);
}