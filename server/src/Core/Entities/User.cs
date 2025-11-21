namespace ChessProject.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = String.Empty;
    public string PasswordHash { get; set; } = String.Empty;
    public string Role { get; set; } = String.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}