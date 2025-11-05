namespace ChessProject.Application.Services;

public interface IAuthService
{
    Task RegisterAsync(string username, string password);

    Task<String> LoginAsync(string username, string password);
}