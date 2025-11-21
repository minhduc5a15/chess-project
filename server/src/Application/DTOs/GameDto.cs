namespace ChessProject.Application.DTOs;

public class GameDto
{
    public Guid Id { get; set; }
    public string? WhitePlayerId { get; set; }
    public string? BlackPlayerId { get; set; }

    public string? WhiteUsername { get; set; }
    public string? BlackUsername { get; set; }

    public string FEN { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? WinnerId { get; set; }
    public long WhiteTimeRemainingMs { get; set; }
    public long BlackTimeRemainingMs { get; set; }
    public DateTime? LastMoveAt { get; set; }
    public string MoveHistory { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}