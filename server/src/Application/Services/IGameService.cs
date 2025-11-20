using ChessProject.Application.DTOs;

namespace ChessProject.Application.Services;

public interface IGameService
{
    Task<GameDto> CreateGameAsync(string playerId); // playerId là người tạo
    Task<IEnumerable<GameDto>> GetWaitingGamesAsync();

    Task<GameDto?> GetGameByIdAsync(Guid gameId);
    Task<bool> JoinGameAsync(Guid gameId, string playerId);
    Task UpdateGameFenAsync(Guid gameId, string newFen);

    Task<bool> MakeMoveAsync(Guid gameId, string moveUCI, string playerId);
}