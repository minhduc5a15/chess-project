namespace ChessProject.Core.Entities;

public class Game
{
    public Guid Id { get; set; }
    public string? WhitePlayerId { get; set; }
    public string? BlackPlayerId { get; set; }

    // Standard initial chess position FEN
    public string FEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public string MoveHistory { get; set; } = "";

    public string Status { get; set; } = "WAITING"; // WAITING, PLAYING, FINISHED

    public string? WinnerId { get; set; }

    public long WhiteTimeRemainingMs { get; set; } = 10 * 60 * 1000;
    public long BlackTimeRemainingMs { get; set; } = 10 * 60 * 1000;
    // Increment per move in milliseconds
    public long IncrementMs { get; set; } = 0;

    public DateTime? LastMoveAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? FinishedAt { get; set; }
}