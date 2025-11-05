using ChessProject.Application.DTOs;
using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;

namespace ChessProject.Application.Services;

public class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;

    public GameService(IGameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<GameDto> CreateGameAsync(string playerId)
    {
        var game = new Game
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = playerId, // Mặc định người tạo cầm quân Trắng
            Status = "WAITING",
            CreatedAt = DateTime.UtcNow
        };

        await _gameRepository.AddAsync(game);

        return MapToDto(game);
    }

    public async Task<IEnumerable<GameDto>> GetWaitingGamesAsync()
    {
        var games = await _gameRepository.GetWaitingGamesAsync();
        return games.Select(MapToDto);
    }

    // Hàm helper đơn giản để chuyển Entity -> DTO
    private static GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            FEN = game.FEN,
            Status = game.Status,
            CreatedAt = game.CreatedAt
        };
    }
}