namespace ChessProject.Core.Entities;

public class Game
{
    public Guid Id { get; set; }
    public string? WhitePlayerId { get; set; }
    public string? BlackPlayerId { get; set; }

    public string FEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public string Status { get; set; } = "WAITING";
    
    public string? WinnerId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? FinishedAt { get; set; }
}