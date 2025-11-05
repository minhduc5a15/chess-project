using ChessProject.Application.DTOs;

namespace ChessProject.Application.Services;

public interface IGameService
{
    Task<GameDto> CreateGameAsync(string playerId); // playerId là người tạo
    Task<IEnumerable<GameDto>> GetWaitingGamesAsync();
}