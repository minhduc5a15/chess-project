namespace ChessProject.Core.Entities;

public class Game
{
    public Guid Id { get; set; }
    public string? WhitePlayerId { get; set; }
    public string? BlackPlayerId { get; set; }

    public string FEN { get; set; } = "7r/4k3/8/8/8/8/8/1N2K1B1 w - - 0 1";

    public string MoveHistory { get; set; } = "";

    public string Status { get; set; } = "WAITING"; // WAITING, PLAYING, FINISHED

    public string? WinnerId { get; set; }

    public long WhiteTimeRemainingMs { get; set; } = 10 * 60 * 1000;
    public long BlackTimeRemainingMs { get; set; } = 10 * 60 * 1000;

    public DateTime? LastMoveAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? FinishedAt { get; set; }
}